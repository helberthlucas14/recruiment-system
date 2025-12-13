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
