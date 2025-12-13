package domain

type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id uint) (*User, error)
}

type JobRepository interface {
	Create(job *Job) error
	Update(job *Job) error
	FindAll(page, limit int, query string, status string) ([]Job, int64, error)
	FindByID(id uint) (*Job, error)
	FindByRecruiterID(recruiterID uint, page, limit int, query string, status string) ([]Job, int64, error)
}
