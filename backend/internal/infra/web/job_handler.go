package web

import (
	"net/http"

	"github.com/helberthlucas14/internal/dto"

	"github.com/helberthlucas14/internal/usecase"

	"github.com/helberthlucas14/internal/domain"

	"github.com/gin-gonic/gin"
)

type JobHandler struct {
	jobUseCase *usecase.JobUseCase
}

func NewJobHandler(jobUseCase *usecase.JobUseCase) *JobHandler {
	return &JobHandler{jobUseCase: jobUseCase}
}

// CreateJob godoc
// @Summary Create a new job
// @Description Create a job posting (Recruiter only)
// @Tags jobs
// @Accept json
// @Produce json
// @Param request body CreateJobRequest true "Create Job Request"
// @Security BearerAuth
// @Success 201 {object} dto.CreateJobOutputDTO
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /jobs [post]
func (h *JobHandler) CreateJob(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleRecruiter {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only recruiters can create jobs"})
		return
	}

	var req CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	recruiterID := c.GetUint("user_id")
	job, err := h.jobUseCase.CreateJob(dto.CreateJobInputDTO{
		Title:        req.Title,
		Description:  req.Description,
		Company:      req.Company,
		Location:     req.Location,
		Requirements: req.Requirements,
		Salary:       req.Salary,
		RecruiterID:  recruiterID,
		Anonymous:    req.Anonymous,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, job)
}

type CreateJobRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description" binding:"required"`
	Company      string `json:"company" binding:"required"`
	Location     string `json:"location" binding:"required"`
	Requirements string `json:"requirements"`
	Salary       string `json:"salary"`
	Anonymous    bool   `json:"anonymous"`
}
