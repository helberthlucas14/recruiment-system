import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Pagination, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/lib/api';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import FeedbackDialog from '../components/dialogs/FeedbackDialog';
import { useToast } from '../context/toastBase';
import type { Application, PaginatedResponse } from '../../domain/types';

const MyApplications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState<boolean>(false);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

    const handleCancel = (appID: number) => {
        setPendingCancelId(appID);
        setConfirmCancelOpen(true);
    };

    const confirmCancel = async () => {
        if (!pendingCancelId) return;
        try {
            await api.patch(`/applications/${pendingCancelId}/cancel`);
            setConfirmCancelOpen(false);
            setPendingCancelId(null);
            await fetchApplications();
            setFeedbackMessage('Candidatura cancelada com sucesso');
            setFeedbackOpen(true);
            showToast({ message: 'Candidatura cancelada', severity: 'success' });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to cancel application';
            setError(message);
            setConfirmCancelOpen(false);
            setPendingCancelId(null);
            showToast({ message, severity: 'error' });
        }
    };

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<PaginatedResponse<Application>>('/applications', {
                params: { page, limit: 10 }
            });
            setApplications(response.data.data || []);
            setTotalPages(response.data.meta?.total_pages || 1);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Falha ao carregar candidaturas.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">Minhas Candidaturas</Typography>
                <Button variant="outlined" onClick={() => navigate('/jobs')}>Voltar para Vagas</Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Título</TableCell>
                                    <TableCell>Empresa</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Ação</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="bold">{app.job_title || 'Vaga desconhecida'}</Typography>
                                            <Typography variant="caption" color="text.secondary">ID: {app.job_id}</Typography>
                                        </TableCell>
                                        <TableCell>{app.company || '-'}</TableCell>
                                        <TableCell>{app.applied_at || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={app.status}
                                                color={app.status === 'HIRED' ? 'success' : app.status === 'PENDING' ? 'primary' : app.status === 'CANCELED' ? 'default' : 'secondary'}
                                                variant={app.status === 'PENDING' ? 'filled' : 'outlined'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {app.status === 'PENDING' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleCancel(app.id)}
                                                >
                                                    Cancelar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {applications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography color="text.secondary" py={2}>
                                                Você ainda não se candidatou a nenhuma vaga.
                                            </Typography>
                                            <Button variant="contained" href="/jobs" sx={{ mt: 1 }}>
                                                Ver Vagas
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box mt={4} display="flex" justifyContent="center">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, p) => setPage(p)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
            <ConfirmDialog
              open={confirmCancelOpen}
              title="Confirmar Cancelamento"
              content={<>Deseja cancelar esta candidatura?</>}
              onCancel={() => setConfirmCancelOpen(false)}
              onConfirm={confirmCancel}
              cancelText="Não"
              confirmText="Sim"
              confirmColor="error"
            />

            <FeedbackDialog
              open={feedbackOpen}
              title="Ação concluída"
              message={<>{feedbackMessage}</>}
              onClose={() => setFeedbackOpen(false)}
            />
        </Container>
    );
};
export default MyApplications;
