package repository

import (
	"github.com/helberthlucas14/internal/domain"

	"github.com/helberthlucas14/internal/infra/database"
)

type ApplicationRepository struct{}

func NewApplicationRepository() *ApplicationRepository {
	return &ApplicationRepository{}
}

func (r *ApplicationRepository) Create(app *domain.Application) error {
	return database.DB.Create(app).Error
}

func (r *ApplicationRepository) Exists(jobID, candidateID uint) (bool, error) {
	var count int64
	err := database.DB.Model(&domain.Application{}).
		Where("job_id = ? AND candidate_id = ?", jobID, candidateID).
		Count(&count).Error
	return count > 0, err
}
