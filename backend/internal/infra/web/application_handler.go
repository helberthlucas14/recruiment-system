package web

import (
	"net/http"
	"strconv"

	"github.com/helberthlucas14/internal/domain"
	"github.com/helberthlucas14/internal/dto"
	"github.com/helberthlucas14/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ApplicationHandler struct {
	appUseCase *usecase.ApplicationUseCase
}

func NewApplicationHandler(appUseCase *usecase.ApplicationUseCase) *ApplicationHandler {
	return &ApplicationHandler{appUseCase: appUseCase}
}

// ApplyJob godoc
// @Summary Apply for a job
// @Description Apply for a job as a candidate
// @Tags applications
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Security BearerAuth
// @Success 201 {object} dto.ApplyJobOutputDTO
// @Failure 400 {object} ErrorResponse
// @Router /jobs/{id}/apply [post]
func (h *ApplicationHandler) ApplyJob(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleCandidate {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only candidates can apply"})
		return
	}

	jobIDStr := c.Param("id")
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid Job ID"})
		return
	}

	candidateID := c.GetUint("user_id")
	app, err := h.appUseCase.Apply(dto.ApplyJobInputDTO{
		JobID:       uint(jobID),
		CandidateID: candidateID,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, app)
}

// MyApplications godoc
// @Summary Get my applications
// @Description List all applications for the logged in candidate
// @Tags applications
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Security BearerAuth
// @Success 200 {object} dto.PaginatedApplicationsOutputDTO
// @Router /applications [get]
func (h *ApplicationHandler) MyApplications(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleCandidate {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only candidates can view their applications"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	candidateID := c.GetUint("user_id")
	apps, err := h.appUseCase.GetMyApplications(candidateID, dto.PaginationInputDTO{
		Page:  page,
		Limit: limit,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, apps)
}

// GetJobApplications godoc
// @Summary Get job applications
// @Description List all applications for a specific job (Recruiter only)
// @Tags applications
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Param status query string false "Filter by status (e.g., PENDING)"
// @Security BearerAuth
// @Success 200 {object} dto.PaginatedApplicationsOutputDTO
// @Router /jobs/{id}/applications [get]
func (h *ApplicationHandler) GetJobApplications(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok || role != domain.RoleRecruiter {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Only recruiters can view job applications"})
		return
	}

	idStr := c.Param("id")
	jobID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid Job ID"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")

	apps, err := h.appUseCase.GetJobApplications(uint(jobID), dto.PaginationInputDTO{
		Page:   page,
		Limit:  limit,
		Status: status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, apps)
}
