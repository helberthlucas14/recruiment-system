package domain

type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id uint) (*User, error)
}

type JobRepository interface {
	Create(job *Job) error
}
