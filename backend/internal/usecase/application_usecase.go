package usecase

import (
	"errors"

	"github.com/helberthlucas14/internal/domain"
	"github.com/helberthlucas14/internal/dto"
)

type ApplicationUseCase struct {
	appRepo domain.ApplicationRepository
	jobRepo domain.JobRepository
}

func NewApplicationUseCase(appRepo domain.ApplicationRepository, jobRepo domain.JobRepository) *ApplicationUseCase {
	return &ApplicationUseCase{appRepo: appRepo, jobRepo: jobRepo}
}

func (uc *ApplicationUseCase) Apply(input dto.ApplyJobInputDTO) (*dto.ApplyJobOutputDTO, error) {
	job, err := uc.jobRepo.FindByID(input.JobID)
	if err != nil {
		return nil, errors.New("job not found")
	}

	if job.Status != "OPEN" {
		return nil, errors.New("applications are only allowed for OPEN jobs")
	}

	exists, err := uc.appRepo.Exists(input.JobID, input.CandidateID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("already applied to this job")
	}

	app := &domain.Application{
		JobID:       input.JobID,
		CandidateID: input.CandidateID,
		Status:      domain.StatusPending,
	}

	err = uc.appRepo.Create(app)
	if err != nil {
		return nil, err
	}

	return &dto.ApplyJobOutputDTO{
		ID:          app.ID,
		JobID:       app.JobID,
		CandidateID: app.CandidateID,
		Status:      string(app.Status),
		AppliedAt:   app.CreatedAt.Format("2006-01-02"),
	}, nil
}

func (uc *ApplicationUseCase) GetMyApplications(candidateID uint, input dto.PaginationInputDTO) (*dto.PaginatedApplicationsOutputDTO, error) {
	page := input.Page
	if page <= 0 {
		page = 1
	}
	limit := input.Limit
	if limit <= 0 {
		limit = 10
	}

	apps, total, err := uc.appRepo.FindByCandidateID(candidateID, page, limit)
	if err != nil {
		return nil, err
	}

	output := make([]dto.ApplyJobOutputDTO, len(apps))

	for i, a := range apps {
		output[i] = dto.ApplyJobOutputDTO{
			ID:          a.ID,
			JobID:       a.JobID,
			JobTitle:    a.Job.Title,
			Company:     a.Job.Company,
			Location:    a.Job.Location,
			CandidateID: a.CandidateID,
			Status:      string(a.Status),
			AppliedAt:   a.CreatedAt.Format("2006-01-02"),
		}
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PaginatedApplicationsOutputDTO{
		Data: output,
		Meta: dto.MetaDTO{
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (uc *ApplicationUseCase) GetJobApplications(jobID uint, input dto.PaginationInputDTO) (*dto.PaginatedApplicationsOutputDTO, error) {
	page := input.Page
	if page <= 0 {
		page = 1
	}
	limit := input.Limit
	if limit <= 0 {
		limit = 10
	}

	apps, total, err := uc.appRepo.FindPaginatedByJobID(jobID, page, limit, input.Status)
	if err != nil {
		return nil, err
	}

	output := make([]dto.ApplyJobOutputDTO, len(apps))
	for i, a := range apps {
		output[i] = dto.ApplyJobOutputDTO{
			ID:            a.ID,
			JobID:         a.JobID,
			JobTitle:      a.Job.Title,
			CandidateID:   a.CandidateID,
			CandidateName: a.Candidate.Name,
			Status:        string(a.Status),
			AppliedAt:     a.CreatedAt.Format("2006-01-02"),
		}
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PaginatedApplicationsOutputDTO{
		Data: output,
		Meta: dto.MetaDTO{
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (uc *ApplicationUseCase) GetCandidateStats(candidateID uint) (*dto.DashboardStatsDTO, error) {
	applied, err := uc.appRepo.GetStats(candidateID)
	if err != nil {
		return nil, err
	}

	pending, err := uc.appRepo.GetPendingCount(candidateID)
	if err != nil {
		return nil, err
	}

	return &dto.DashboardStatsDTO{
		Applied: applied,
		Pending: pending,
	}, nil
}
