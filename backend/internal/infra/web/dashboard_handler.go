package web

import (
	"net/http"

	"github.com/helberthlucas14/internal/domain"
	"github.com/helberthlucas14/internal/usecase"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	appUseCase *usecase.ApplicationUseCase
}

func NewDashboardHandler(appUseCase *usecase.ApplicationUseCase) *DashboardHandler {
	return &DashboardHandler{appUseCase: appUseCase}
}

// GetSummary godoc
// @Summary Get dashboard summary
// @Description Get statistics for the dashboard
// @Tags dashboard
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.DashboardStatsDTO
// @Router /dashboard/summary [get]
func (h *DashboardHandler) GetSummary(c *gin.Context) {
	roleVal, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}
	role, ok := roleVal.(domain.Role)
	if !ok {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "Invalid role"})
		return
	}

	if role == domain.RoleCandidate {
		candidateID := c.GetUint("user_id")
		stats, err := h.appUseCase.GetCandidateStats(candidateID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusOK, stats)
		return
	}

	c.JSON(http.StatusOK, gin.H{"applied": 0})
}
