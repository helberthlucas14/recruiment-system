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

type UpdateJobInputDTO struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Company      string `json:"company"`
	Location     string `json:"location"`
	Requirements string `json:"requirements"`
	Salary       string `json:"salary"`
	Status       string `json:"status"`
}

// Pagination
type PaginationInputDTO struct {
	Page   int    `form:"page" json:"page"`
	Limit  int    `form:"limit" json:"limit"`
	Query  string `form:"q" json:"q"`
	Status string `form:"status" json:"status"`
}

type MetaDTO struct {
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
}

type PaginatedJobsOutputDTO struct {
	Data []GetJobOutputDTO `json:"data"`
	Meta MetaDTO           `json:"meta"`
}

// Application
type ApplyJobInputDTO struct {
	JobID       uint `json:"job_id"`
	CandidateID uint `json:"candidate_id"`
}

type ApplyJobOutputDTO struct {
	ID            uint   `json:"id"`
	JobID         uint   `json:"job_id"`
	JobTitle      string `json:"job_title"`
	Company       string `json:"company"`
	Location      string `json:"location"`
	CandidateID   uint   `json:"candidate_id"`
	CandidateName string `json:"candidate_name,omitempty"`
	Status        string `json:"status"`
	AppliedAt     string `json:"applied_at"`
}
