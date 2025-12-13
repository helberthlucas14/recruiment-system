package dto

import "github.com/helberthlucas14/internal/domain"

// Auth
type RegisterInputDTO struct {
	Name     string
	Email    string
	Password string
	Role     domain.Role
}

type RegisterOutputDTO struct {
	ID    uint
	Name  string
	Email string
	Role  domain.Role
}

type LoginInputDTO struct {
	Email    string
	Password string
}

type LoginOutputDTO struct {
	Token string
}

// Job
type CreateJobInputDTO struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Company      string `json:"company"`
	Location     string `json:"location"`
	Requirements string `json:"requirements"`
	Salary       string `json:"salary"`
	RecruiterID  uint   `json:"recruiter_id"`
	Anonymous    bool   `json:"anonymous"`
}

type CreateJobOutputDTO struct {
	ID             uint    `json:"id"`
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	Company        string  `json:"company"`
	Location       string  `json:"location"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
	RecruiterID    uint    `json:"recruiter_id"`
	RecruiterEmail *string `json:"recruiter_email,omitempty"`
	Anonymous      bool    `json:"anonymous"`
}

type GetJobOutputDTO struct {
	ID             uint    `json:"id"`
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	Company        string  `json:"company"`
	Location       string  `json:"location"`
	Requirements   string  `json:"requirements"`
	Salary         string  `json:"salary"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
	RecruiterID    uint    `json:"recruiter_id"`
	RecruiterEmail *string `json:"recruiter_email,omitempty"`
	Anonymous      bool    `json:"anonymous"`
}
