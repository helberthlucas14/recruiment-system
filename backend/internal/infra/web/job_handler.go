package web

import (
	"net/http"
	"strconv"
	"strings"

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

// UpdateJob godoc
// @Summary Update a job (Recruiter only)
// @Description Update job fields; only OPEN or PAUSED jobs can be updated. Status can be OPEN or PAUSED.
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param request body UpdateJobRequest true "Update Job Request"
// @Security BearerAuth
// @Success 200 {object} dto.GetJobOutputDTO
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /jobs/{id} [patch]
func (h *JobHandler) UpdateJob(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleRecruiter {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only recruiters can update jobs"})
		return
	}

	idStr := c.Param("id")
	jobID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid Job ID"})
		return
	}

	var req UpdateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	recruiterID := c.GetUint("user_id")
	output, err := h.jobUseCase.UpdateJob(recruiterID, uint(jobID), dto.UpdateJobInputDTO{
		Title:        req.Title,
		Description:  req.Description,
		Company:      req.Company,
		Location:     req.Location,
		Requirements: req.Requirements,
		Salary:       req.Salary,
		Status:       req.Status,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

// FinalizeJob godoc
// @Summary Finalize a job and hire a candidate
// @Description Close the job and mark the specified candidate as hired
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param request body FinalizeJobRequest true "Finalize Request"
// @Security BearerAuth
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Router /jobs/{id}/finalize [post]
func (h *JobHandler) FinalizeJob(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleRecruiter {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only recruiters can finalize jobs"})
		return
	}

	idStr := c.Param("id")
	jobID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid Job ID"})
		return
	}

	var req FinalizeJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err = h.jobUseCase.FinalizeJob(dto.FinalizeJobInputDTO{
		JobID:       uint(jobID),
		CandidateID: req.CandidateID,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job finalized and candidate hired"})
}

// GetJobs godoc
// @Summary List all jobs
// @Description Get all jobs with optional search query and pagination
// @Tags jobs
// @Accept json
// @Produce json
// @Param q query string false "Search query"
// @Param status query string false "Status filter (OPEN|PAUSED|CLOSED)"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} dto.PaginatedJobsOutputDTO
// @Router /jobs [get]
func (h *JobHandler) GetJobs(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := strings.ToUpper(strings.TrimSpace(c.Query("status")))
	switch status {
	case "OPEN", "PAUSED", "CLOSED":
		// valid
	default:
		status = ""
	}

	jobs, err := h.jobUseCase.GetAllJobs(dto.PaginationInputDTO{
		Page:   page,
		Limit:  limit,
		Query:  query,
		Status: status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

// GetMyJobs godoc
// @Summary List recruiter-owned jobs
// @Description Get jobs created by the logged-in recruiter with optional search and pagination
// @Tags jobs
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param q query string false "Search query"
// @Param status query string false "Status filter (OPEN|PAUSED|CLOSED)"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} dto.PaginatedJobsOutputDTO
// @Router /jobs/mine [get]
func (h *JobHandler) GetMyJobs(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleRecruiter {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only recruiters can view their jobs"})
		return
	}

	query := c.Query("q")
	status := strings.ToUpper(strings.TrimSpace(c.Query("status")))
	switch status {
	case "OPEN", "PAUSED", "CLOSED":
	default:
		status = ""
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	recruiterID := c.GetUint("user_id")

	jobs, err := h.jobUseCase.GetRecruiterJobs(recruiterID, dto.PaginationInputDTO{
		Page:   page,
		Limit:  limit,
		Query:  query,
		Status: status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

// GetJob godoc
// @Summary Get job by ID
// @Description Get details of a specific job
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Success 200 {object} dto.GetJobOutputDTO
// @Failure 404 {object} ErrorResponse
// @Router /jobs/{id} [get]
func (h *JobHandler) GetJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid ID"})
		return
	}

	job, err := h.jobUseCase.GetJobByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
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

type FinalizeJobRequest struct {
	CandidateID uint `json:"candidate_id" binding:"required"`
}

type UpdateJobRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Company      string `json:"company"`
	Location     string `json:"location"`
	Requirements string `json:"requirements"`
	Salary       string `json:"salary"`
	Status       string `json:"status"`
}
