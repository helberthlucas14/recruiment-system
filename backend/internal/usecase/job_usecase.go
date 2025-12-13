package usecase

import (
	"time"

	"github.com/helberthlucas14/internal/dto"

	"github.com/helberthlucas14/internal/domain"
)

type JobUseCase struct {
	jobRepo domain.JobRepository
}

func NewJobUseCase(jobRepo domain.JobRepository) *JobUseCase {
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
