import React, { useState, useEffect } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper,
    List, ListItem, ListItemText,
    Pagination, CircularProgress, Alert, Chip, Divider, Card, CardContent, MenuItem
} from '@mui/material';
import api from '../../shared/lib/api';
import type { Job, PaginatedResponse, DashboardStats, RecruiterStats, Application } from '../../domain/types';
import { Role } from '../../domain/types';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/toastBase';

const JobDashboard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ applied: 0, pending: 0 });
    const [recruiterStats, setRecruiterStats] = useState<RecruiterStats>({ total_jobs: 0, open_jobs: 0, closed_jobs: 0, total_applications: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Job['status'] | ''>('');
    const [error, setError] = useState('');    const { user } = useAuth();
    const navigate = useNavigate();
    const [applicationCounts, setApplicationCounts] = useState<Record<number, number>>({});
    const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
    const { showToast } = useToast();

    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        try {
            const path = user?.role === Role.RECRUITER ? '/jobs/mine' : '/jobs';
            const response = await api.get<PaginatedResponse<Job>>(path, {
                params: { page, limit: 5, q: query, status: statusFilter }
            });
            setJobs(response.data.data || []);
            setTotalPages(response.data.meta?.total_pages || 1);
        } catch {
            setError('Falha ao carregar vagas.');
        } finally {
            setLoading(false);
        }
    }, [page, query, statusFilter, user?.role]);

    const fetchStats = React.useCallback(async () => {
        try {
            const response = await api.get<DashboardStats>('/dashboard/summary');
            const d = response.data || { applied: 0, pending: 0 };
            setStats({ applied: d.applied ?? 0, pending: d.pending ?? 0 });
        } catch {
            setStats({ applied: 0, pending: 0 });
        }
    }, []);

    const fetchRecruiterStats = React.useCallback(async () => {
        try {
            const metaResp = await api.get<PaginatedResponse<Job>>('/jobs/mine', { params: { page: 1, limit: 1 } });
            const totalJobs: number = metaResp.data?.meta?.total || 0;
            let open = 0;
            let closed = 0;
            let totalApplications = 0;

            if (totalJobs > 0) {
                const jobsResp = await api.get<PaginatedResponse<Job>>('/jobs/mine', { params: { page: 1, limit: totalJobs } });
                const allJobs: Job[] = jobsResp.data?.data || [];
                open = allJobs.filter(j => j.status === 'OPEN').length;
                closed = allJobs.filter(j => j.status === 'CLOSED').length;

                const appCounts = await Promise.all(
                    allJobs.map(async (j) => {
                        try {
                            const r = await api.get<PaginatedResponse<import('../../domain/types').Application>>(`/jobs/${j.id}/applications`, { params: { page: 1, limit: 1 } });
                            return r.data?.meta?.total || 0;
                        } catch {
                            return 0;
                        }
                    })
                );
                totalApplications = appCounts.reduce((acc, n) => acc + n, 0);
            }

            setRecruiterStats({ total_jobs: totalJobs, open_jobs: open, closed_jobs: closed, total_applications: totalApplications });
        } catch {
            console.error('Failed to load recruiter stats');
        }
    }, []);

    const fetchApplicationCounts = React.useCallback(async (items: Job[]) => {
        try {
            const results = await Promise.all(
                items.map(async (j) => {
                    try {
                        const r = await api.get<PaginatedResponse<Application>>(`/jobs/${j.id}/applications`, { params: { page: 1, limit: 1 } });
                        return { id: j.id, count: r.data?.meta?.total || 0 };
                    } catch {
                        return { id: j.id, count: 0 };
                    }
                })
            );
            const map: Record<number, number> = {};
            results.forEach(({ id, count }) => { map[id] = count; });
            setApplicationCounts(map);
        } catch {
        }
    }, []);

    const fetchCandidateAppliedJobs = React.useCallback(async () => {
        if (user?.role !== Role.CANDIDATE) return;
        try {
            const metaRes = await api.get<PaginatedResponse<Application>>('/applications', { params: { page: 1, limit: 1 } });
            const total = metaRes.data?.meta?.total || 0;
            const res = await api.get<PaginatedResponse<Application>>('/applications', { params: { page: 1, limit: total || 10 } });
            const ids = new Set<number>((res.data?.data || []).map(a => a.job_id));
            setAppliedJobIds(ids);
        } catch {
        }
    }, [user?.role]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        if (user?.role === Role.CANDIDATE) {
            fetchStats();
            fetchCandidateAppliedJobs();
        }
        if (user?.role === Role.RECRUITER) {
            fetchRecruiterStats();
        }
    }, [user?.role, fetchStats, fetchRecruiterStats, fetchCandidateAppliedJobs]);

    useEffect(() => {
        if (user?.role === Role.RECRUITER && jobs.length > 0) {
            fetchApplicationCounts(jobs);
        }
    }, [user?.role, jobs, fetchApplicationCounts]);

    const handleSearch = () => {
        setPage(1);
        setQuery(search);
    };

    const handleApply = async (jobId: number) => {
        try {
            await api.post(`/jobs/${jobId}/apply`);
            showToast({ message: 'Candidatura enviada com sucesso!', severity: 'success' });
            fetchStats();
            setAppliedJobIds(prev => new Set([...Array.from(prev), jobId]));
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Falha ao aplicar.';
            showToast({ message, severity: 'error' });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    {user?.role === Role.RECRUITER ? 'Painel do Recrutador' : 'Painel do Candidato'}
                </Typography>
                <Typography color="text.secondary">
                    {user?.role === Role.RECRUITER ? `Bem-vindo(a), ${user?.name}! Acompanhe suas vagas e candidaturas.` : `Bem-vindo(a), ${user?.name}! Confira as últimas oportunidades para você.`}
                </Typography>
            </Box>

            {user?.role === Role.CANDIDATE && (
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Candidaturas
                            </Typography>
                            <Typography variant="h4">
                                {stats.applied}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Candidaturas Pendentes
                            </Typography>
                            <Typography variant="h4">
                                {stats.pending}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {user?.role === Role.RECRUITER && (
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total de Vagas
                            </Typography>
                            <Typography variant="h4">
                                {recruiterStats.total_jobs}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Vagas Abertas
                            </Typography>
                            <Typography variant="h4">
                                {recruiterStats.open_jobs}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Vagas Fechadas
                            </Typography>
                            <Typography variant="h4">
                                {recruiterStats.closed_jobs}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, minWidth: 250 }} elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total de Candidaturas
                            </Typography>
                            <Typography variant="h4">
                                {recruiterStats.total_applications}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{user?.role === Role.RECRUITER ? 'Minhas Vagas' : 'Vagas Recentes'}</Typography>
                {user?.role === Role.RECRUITER && (
                    <Button variant="contained" onClick={() => navigate('/create-job')}>
                        Criar Vaga
                    </Button>
                )}
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label={user?.role === Role.RECRUITER ? 'Buscar nas minhas vagas...' : 'Buscar por título ou palavra-chave...'}
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ bgcolor: 'background.paper' }}
                />
                <Button variant="contained" onClick={handleSearch}>Buscar</Button>
                <TextField
                    label="Status da Vaga"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Job['status'] | '')}
                    select
                    size="small"
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="OPEN">Aberta</MenuItem>
                    <MenuItem value="CLOSED">Fechada</MenuItem>
                </TextField>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <>
                    <Paper elevation={0} variant="outlined">
                        <List>
                            {jobs.map((job, index) => (
                                <React.Fragment key={job.id}>
                                    {index > 0 && <Divider component="li" />}
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{ py: 2 }}
                                        secondaryAction={
                                            <>
                                                {user?.role === Role.CANDIDATE && job.status === 'OPEN' && (
                                                    appliedJobIds.has(job.id) ? (
                                                        <Button variant="outlined" size="small" disabled>
                                                            Aplicado
                                                        </Button>
                                                    ) : (
                                                        <Button variant="contained" size="small" onClick={() => handleApply(job.id)}>
                                                            Aplicar
                                                        </Button>
                                                    )
                                                )}
                                                {user?.role === Role.RECRUITER && (
                                                    <Button variant="outlined" size="small" onClick={() => navigate(`/jobs/${job.id}/manage`)}>
                                                        Gerenciar
                                                    </Button>
                                                )}
                                            </>
                                        }
                                    >
                                        <ListItemText
                                            disableTypography
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                                                        {job.title}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Chip label={job.status} size="small" color={job.status === 'OPEN' ? 'success' : 'default'} variant="outlined" />
                                                        {user?.role === Role.RECRUITER && (
                                                            <Chip label={`${applicationCounts[job.id] ?? 0} candidaturas`} size="small" variant="outlined" />
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={
                                                <Box mt={1}>
                                                    <Typography component="span" variant="subtitle2" color="text.primary" display="block">
                                                        {job.company || "Empresa desconhecida"} • {job.location || "Remoto"}
                                                    </Typography>
                                                    {!!job.recruiter_email && !job.anonymous && (
                                                        <Typography component="div" variant="caption" color="text.secondary">
                                                            Contato: {job.recruiter_email}
                                                        </Typography>
                                                    )}
                                                    <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {job.description}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="text.disabled">
                                                        Publicada em {new Date(job.created_at || '').toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        
                                    </ListItem>
                                </React.Fragment>
                            ))}
                            {jobs.length === 0 && (
                                <Box p={4} textAlign="center">
                                    <Typography color="text.secondary">{user?.role === Role.RECRUITER ? 'Você ainda não possui vagas.' : 'Nenhuma vaga encontrada.'}</Typography>
                                    {user?.role === Role.RECRUITER && (
                                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/create-job')}>Criar Vaga</Button>
                                    )}
                                </Box>
                            )}
                        </List>
                    </Paper>
                    <Box mt={4} display="flex" justifyContent="center">
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, p) => setPage(p)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default JobDashboard;
