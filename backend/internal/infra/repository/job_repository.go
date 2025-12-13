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

func (r *JobRepository) Update(job *domain.Job) error {
	return database.DB.Save(job).Error
}

func (r *JobRepository) FindAll(page, limit int, query string, status string) ([]domain.Job, int64, error) {
	var jobs []domain.Job
	var total int64

	db := database.DB.Model(&domain.Job{}).Preload("Recruiter")

	if query != "" {
		db = db.Where("title LIKE ? OR description LIKE ?", "%"+query+"%", "%"+query+"%")
	}

	if status != "" {
		db = db.Where("status = ?", status)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := db.Limit(limit).Offset(offset).Order("created_at desc").Find(&jobs).Error
	return jobs, total, err
}

func (r *JobRepository) FindByID(id uint) (*domain.Job, error) {
	var job domain.Job
	err := database.DB.Preload("Recruiter").First(&job, id).Error
	return &job, err
}

func (r *JobRepository) FindByRecruiterID(recruiterID uint, page, limit int, query string, status string) ([]domain.Job, int64, error) {
	var jobs []domain.Job
	var total int64

	db := database.DB.Model(&domain.Job{}).Where("recruiter_id = ?", recruiterID).Preload("Recruiter")

	if query != "" {
		db = db.Where("title LIKE ? OR description LIKE ?", "%"+query+"%", "%"+query+"%")
	}

	if status != "" {
		db = db.Where("status = ?", status)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := db.Limit(limit).Offset(offset).Order("created_at desc").Find(&jobs).Error
	return jobs, total, err
}
