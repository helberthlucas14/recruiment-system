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
