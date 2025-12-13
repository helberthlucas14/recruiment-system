package repository

import (
	"github.com/helberthlucas14/internal/infra/database"

	"github.com/helberthlucas14/internal/domain"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) Create(user *domain.User) error {
	return database.DB.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	err := database.DB.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *UserRepository) FindByID(id uint) (*domain.User, error) {
	var user domain.User
	err := database.DB.First(&user, id).Error
	return &user, err
}
