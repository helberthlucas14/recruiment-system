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

type ApplicationRepository interface {
	Create(app *Application) error
	FindByCandidateID(candidateID uint, page, limit int) ([]Application, int64, error)
	FindByJobID(jobID uint) ([]Application, error)
	FindPaginatedByJobID(jobID uint, page, limit int, status string) ([]Application, int64, error)
	Exists(jobID, candidateID uint) (bool, error)
	FindByID(id uint) (*Application, error)
	GetStats(candidateID uint) (int64, error)
	GetPendingCount(candidateID uint) (int64, error)
}
