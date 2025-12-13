package domain

import (
	"time"

	"gorm.io/gorm"
)

type Job struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `gorm:"not null" json:"description"`
	Company      string         `gorm:"not null" json:"company"`
	Location     string         `gorm:"not null" json:"location"`
	Requirements string         `json:"requirements"`
	Salary       string         `json:"salary"`
	Status       string         `gorm:"default:'OPEN'" json:"status"`
	RecruiterID  uint           `gorm:"default:0" json:"recruiter_id"`
	Recruiter    User           `gorm:"foreignKey:RecruiterID" json:"-"`
	Anonymous    bool           `gorm:"default:false" json:"anonymous"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
