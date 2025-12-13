package usecase

import (
	"github.com/helberthlucas14/internal/domain"

	"github.com/helberthlucas14/internal/dto"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUseCase struct {
	userRepo  domain.UserRepository
	jwtSecret string
}

func NewAuthUseCase(userRepo domain.UserRepository, jwtSecret string) *AuthUseCase {
	return &AuthUseCase{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

type Claims struct {
	UserID uint        `json:"user_id"`
	Email  string      `json:"email"`
	Name   string      `json:"name"`
	Role   domain.Role `json:"role"`
	jwt.RegisteredClaims
}

func (uc *AuthUseCase) Register(input dto.RegisterInputDTO) (*dto.RegisterOutputDTO, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     input.Role,
	}

	if err := uc.userRepo.Create(user); err != nil {
		return nil, err
	}

	return &dto.RegisterOutputDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}, nil

}
