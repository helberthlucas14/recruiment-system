package main

import (
	"fmt"
	"log"

	"github.com/helberthlucas14/internal/config"
	"github.com/helberthlucas14/internal/domain"
	"github.com/helberthlucas14/internal/infra/database"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.LoadConfig()
	database.Connect(cfg)
	database.Migrate(&domain.User{}, &domain.Job{}, &domain.Application{})

	var jobCount int64
	database.DB.Model(&domain.Job{}).Count(&jobCount)
	if jobCount > 0 {
		log.Println("Seed: jobs already exist, skipping")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Seed: failed to hash password: %v", err)
	}
	recruiter := domain.User{Name: "Teste Recruiter", Email: "teste@empresa.com", Password: string(hash), Role: domain.RoleRecruiter}
	if err := database.DB.Create(&recruiter).Error; err != nil {
		log.Fatalf("Seed: failed to create recruiter: %v", err)
	}

	for i := 1; i <= 100; i++ {
		job := domain.Job{Title: fmt.Sprintf("Vaga #%d", i), Description: "Descrição da vaga", Company: "Empresa Demo", Location: "Remoto", Requirements: "Requisitos básicos", Salary: "8000", RecruiterID: recruiter.ID, Anonymous: false}
		if err := database.DB.Create(&job).Error; err != nil {
			log.Printf("Seed: failed to create job %d: %v", i, err)
		}
	}
	log.Println("Seed: database seeded successfully")
}
