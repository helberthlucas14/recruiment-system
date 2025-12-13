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
