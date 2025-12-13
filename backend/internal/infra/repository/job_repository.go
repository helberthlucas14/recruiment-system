package repository

import (
	"github.com/helberthlucas14/internal/infra/database"

	"github.com/helberthlucas14/internal/domain"
)

type JobRepository struct{}

func NewJobRepository() *JobRepository {
	return &JobRepository{}
}

func (r *JobRepository) Create(job *domain.Job) error {
	return database.DB.Create(job).Error
}
