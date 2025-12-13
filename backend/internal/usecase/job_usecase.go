package usecase

import (
	"errors"
	"time"

	"github.com/helberthlucas14/internal/dto"

	"github.com/helberthlucas14/internal/domain"
)

type JobUseCase struct {
	jobRepo domain.JobRepository
	appRepo domain.ApplicationRepository
}

func NewJobUseCase(jobRepo domain.JobRepository, appRepo domain.ApplicationRepository) *JobUseCase {
	return &JobUseCase{
		jobRepo: jobRepo,
	}
}

func (uc *JobUseCase) CreateJob(input dto.CreateJobInputDTO) (*dto.CreateJobOutputDTO, error) {
	job := &domain.Job{
		Title:        input.Title,
		Description:  input.Description,
		Company:      input.Company,
		Location:     input.Location,
		Requirements: input.Requirements,
		Salary:       input.Salary,
		Status:       "OPEN",
		RecruiterID:  input.RecruiterID,
		Anonymous:    input.Anonymous,
	}
	err := uc.jobRepo.Create(job)
	if err != nil {
		return nil, err
	}
	var recruiterEmail *string
	if !job.Anonymous {
		recruiterEmail = nil
	}
	return &dto.CreateJobOutputDTO{
		ID:             job.ID,
		Title:          job.Title,
		Description:    job.Description,
		Company:        job.Company,
		Location:       job.Location,
		Status:         job.Status,
		CreatedAt:      job.CreatedAt.Format(time.RFC3339),
		RecruiterID:    job.RecruiterID,
		RecruiterEmail: recruiterEmail,
		Anonymous:      job.Anonymous,
	}, nil
}

func (uc *JobUseCase) GetAllJobs(input dto.PaginationInputDTO) (*dto.PaginatedJobsOutputDTO, error) {
	page := input.Page
	if page <= 0 {
		page = 1
	}
	limit := input.Limit
	if limit <= 0 {
		limit = 10
	}

	jobs, total, err := uc.jobRepo.FindAll(page, limit, input.Query, input.Status)
	if err != nil {
		return nil, err
	}

	output := make([]dto.GetJobOutputDTO, len(jobs))
	for i, j := range jobs {
		output[i] = dto.GetJobOutputDTO{
			ID:           j.ID,
			Title:        j.Title,
			Description:  j.Description,
			Company:      j.Company,
			Location:     j.Location,
			Requirements: j.Requirements,
			Salary:       j.Salary,
			Status:       j.Status,
			CreatedAt:    j.CreatedAt.Format(time.RFC3339),
			RecruiterID:  j.RecruiterID,
			RecruiterEmail: func() *string {
				if j.Anonymous {
					return nil
				}
				e := j.Recruiter.Email
				return &e
			}(),
			Anonymous: j.Anonymous,
		}
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PaginatedJobsOutputDTO{
		Data: output,
		Meta: dto.MetaDTO{
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (uc *JobUseCase) GetJobByID(id uint) (*dto.GetJobOutputDTO, error) {
	job, err := uc.jobRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return &dto.GetJobOutputDTO{
		ID:           job.ID,
		Title:        job.Title,
		Description:  job.Description,
		Company:      job.Company,
		Location:     job.Location,
		Requirements: job.Requirements,
		Salary:       job.Salary,
		Status:       job.Status,
		CreatedAt:    job.CreatedAt.Format(time.RFC3339),
		RecruiterID:  job.RecruiterID,
		RecruiterEmail: func() *string {
			if job.Anonymous {
				return nil
			}
			e := job.Recruiter.Email
			return &e
		}(),
		Anonymous: job.Anonymous,
	}, nil
}

func (uc *JobUseCase) GetRecruiterJobs(recruiterID uint, input dto.PaginationInputDTO) (*dto.PaginatedJobsOutputDTO, error) {
	page := input.Page
	if page <= 0 {
		page = 1
	}
	limit := input.Limit
	if limit <= 0 {
		limit = 10
	}

	jobs, total, err := uc.jobRepo.FindByRecruiterID(recruiterID, page, limit, input.Query, input.Status)
	if err != nil {
		return nil, err
	}

	output := make([]dto.GetJobOutputDTO, len(jobs))
	for i, j := range jobs {
		output[i] = dto.GetJobOutputDTO{
			ID:           j.ID,
			Title:        j.Title,
			Description:  j.Description,
			Company:      j.Company,
			Location:     j.Location,
			Requirements: j.Requirements,
			Salary:       j.Salary,
			Status:       j.Status,
			CreatedAt:    j.CreatedAt.Format(time.RFC3339),
			RecruiterID:  j.RecruiterID,
			RecruiterEmail: func() *string {
				if j.Anonymous {
					return nil
				}
				e := j.Recruiter.Email
				return &e
			}(),
			Anonymous: j.Anonymous,
		}
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PaginatedJobsOutputDTO{
		Data: output,
		Meta: dto.MetaDTO{
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (uc *JobUseCase) FinalizeJob(input dto.FinalizeJobInputDTO) error {
	// 1. Get Job
	job, err := uc.jobRepo.FindByID(input.JobID)
	if err != nil {
		return err
	}

	if job.Status != "OPEN" {
		return errors.New("only OPEN jobs can be finalized")
	}

	// 2. Update Job Status
	job.Status = "CLOSED"
	if err := uc.jobRepo.Update(job); err != nil {
		return err
	}

	// 3. Update applications: hire selected, reject others
	apps, err := uc.appRepo.FindByJobID(input.JobID)
	if err != nil {
		return err
	}

	found := false
	for i := range apps {
		if apps[i].CandidateID == input.CandidateID {
			apps[i].Status = domain.StatusHired
			if err := uc.appRepo.Update(&apps[i]); err != nil {
				return err
			}
			found = true
		} else {
			if apps[i].Status != domain.StatusCanceled {
				apps[i].Status = domain.StatusRejected
				if err := uc.appRepo.Update(&apps[i]); err != nil {
					return err
				}
			}
		}
	}

	if !found {
		return errors.New("candidate application not found for this job")
	}

	return nil
}

func (uc *JobUseCase) UpdateJob(recruiterID uint, id uint, input dto.UpdateJobInputDTO) (*dto.GetJobOutputDTO, error) {
	job, err := uc.jobRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if job.RecruiterID != recruiterID {
		return nil, errors.New("unauthorized: job does not belong to recruiter")
	}
	if job.Status == "CLOSED" {
		return nil, errors.New("only OPEN or PAUSED jobs can be updated")
	}

	if input.Title != "" {
		job.Title = input.Title
	}
	if input.Description != "" {
		job.Description = input.Description
	}
	if input.Company != "" {
		job.Company = input.Company
	}
	if input.Location != "" {
		job.Location = input.Location
	}
	if input.Requirements != "" {
		job.Requirements = input.Requirements
	}
	if input.Salary != "" {
		job.Salary = input.Salary
	}
	if input.Status != "" {
		switch input.Status {
		case "OPEN", "PAUSED":
			job.Status = input.Status
		case "CLOSED":
			return nil, errors.New("use finalize endpoint to close a job")
		default:
			return nil, errors.New("invalid status")
		}
	}

	if err := uc.jobRepo.Update(job); err != nil {
		return nil, err
	}

	return &dto.GetJobOutputDTO{
		ID:           job.ID,
		Title:        job.Title,
		Description:  job.Description,
		Company:      job.Company,
		Location:     job.Location,
		Requirements: job.Requirements,
		Salary:       job.Salary,
		Status:       job.Status,
		CreatedAt:    job.CreatedAt.Format(time.RFC3339),
		RecruiterID:  job.RecruiterID,
		RecruiterEmail: func() *string {
			if job.Anonymous {
				return nil
			}
			e := job.Recruiter.Email
			return &e
		}(),
		Anonymous: job.Anonymous,
	}, nil
}
