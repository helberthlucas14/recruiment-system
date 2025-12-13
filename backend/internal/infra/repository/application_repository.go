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

func (r *ApplicationRepository) Update(app *domain.Application) error {
	return database.DB.Save(app).Error
}

func (r *ApplicationRepository) FindByCandidateID(candidateID uint, page, limit int) ([]domain.Application, int64, error) {
	var apps []domain.Application
	var total int64

	db := database.DB.Model(&domain.Application{}).Where("candidate_id = ?", candidateID)

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := db.Preload("Job").Limit(limit).Offset(offset).Order("created_at desc").Find(&apps).Error
	return apps, total, err
}

func (r *ApplicationRepository) FindByJobID(jobID uint) ([]domain.Application, error) {
	var apps []domain.Application
	err := database.DB.Preload("Candidate").Where("job_id = ?", jobID).Find(&apps).Error
	return apps, err
}

func (r *ApplicationRepository) FindPaginatedByJobID(jobID uint, page, limit int, status string) ([]domain.Application, int64, error) {
	var apps []domain.Application
	var total int64

	db := database.DB.Model(&domain.Application{}).Where("job_id = ?", jobID)
	if status != "" {
		db = db.Where("status = ?", status)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := db.Preload("Candidate").Limit(limit).Offset(offset).Order("created_at desc").Find(&apps).Error
	return apps, total, err
}

func (r *ApplicationRepository) Exists(jobID, candidateID uint) (bool, error) {
	var count int64
	err := database.DB.Model(&domain.Application{}).
		Where("job_id = ? AND candidate_id = ?", jobID, candidateID).
		Count(&count).Error
	return count > 0, err
}

func (r *ApplicationRepository) FindByID(id uint) (*domain.Application, error) {
	var app domain.Application
	err := database.DB.Preload("Job").First(&app, id).Error
	return &app, err
}

func (r *ApplicationRepository) GetStats(candidateID uint) (int64, error) {
	var totalApplied int64

	if err := database.DB.Model(&domain.Application{}).
		Where("candidate_id = ?", candidateID).
		Count(&totalApplied).Error; err != nil {
		return 0, err
	}
	return totalApplied, nil
}

func (r *ApplicationRepository) GetPendingCount(candidateID uint) (int64, error) {
	var pending int64
	if err := database.DB.Model(&domain.Application{}).
		Where("candidate_id = ? AND status = ?", candidateID, domain.StatusPending).
		Count(&pending).Error; err != nil {
		return 0, err
	}
	return pending, nil
}
