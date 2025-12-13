package domain

import (
	"time"

	"gorm.io/gorm"
)

type ApplicationStatus string

const (
	StatusPending  ApplicationStatus = "PENDING"
	StatusRejected ApplicationStatus = "REJECTED"
	StatusHired    ApplicationStatus = "HIRED"
	StatusCanceled ApplicationStatus = "CANCELED"
)

type Application struct {
	ID          uint              `gorm:"primaryKey" json:"id"`
	JobID       uint              `gorm:"not null" json:"job_id"`
	Job         Job               `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"job"`
	CandidateID uint              `gorm:"not null" json:"candidate_id"`
	Candidate   User              `gorm:"foreignKey:CandidateID" json:"candidate"`
	Status      ApplicationStatus `gorm:"default:'PENDING'" json:"status"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
	DeletedAt   gorm.DeletedAt    `gorm:"index" json:"-"`
}
