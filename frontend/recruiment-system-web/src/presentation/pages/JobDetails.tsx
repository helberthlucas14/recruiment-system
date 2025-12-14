import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/toastBase';
import { Container, Box, Typography, Chip, Card, CardContent, Button, Alert, CircularProgress, Divider, Paper, TextField, MenuItem } from '@mui/material';
import api from '../../shared/lib/api';
import type { Job, Application, PaginatedResponse } from '../../domain/types';
import { Role } from '../../domain/types';
import { useAuth } from '../context/useAuth';

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const jobId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Job>(`/jobs/${jobId}`);
      setJob(res.data);
    } catch {
      setError('Falha ao carregar a vaga.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchApplications = useCallback(async () => {
    if (user?.role !== Role.RECRUITER) return;
    try {
      const res = await api.get<PaginatedResponse<Application>>(`/jobs/${jobId}/applications`, { params: { page: 1, limit: 20 } });
      setApps(res.data?.data || []);
    } catch {
    }
  }, [jobId, user?.role]);

  const fetchHasApplied = useCallback(async () => {
    if (user?.role !== Role.CANDIDATE) return;
    try {
      const metaRes = await api.get<PaginatedResponse<Application>>('/applications', { params: { page: 1, limit: 1 } });
      const total = metaRes.data?.meta?.total || 0;
      const res = await api.get<PaginatedResponse<Application>>('/applications', { params: { page: 1, limit: total || 10 } });
      const list = res.data?.data || [];
      setHasApplied(list.some(a => a.job_id === jobId));
    } catch {
      setHasApplied(false);
    }
  }, [jobId, user?.role]);

  useEffect(() => {
    if (!Number.isFinite(jobId)) return;
    fetchJob();
    fetchApplications();
    fetchHasApplied();
  }, [fetchJob, fetchApplications, fetchHasApplied, jobId]);

  const handleApply = async () => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      showToast({ message: 'Candidatura enviada com sucesso', severity: 'success' });
      setHasApplied(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Falha ao aplicar.';
      showToast({ message, severity: 'error' });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;
  if (!job) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">{job.title}</Typography>
        <Chip label={job.status === 'OPEN' ? 'Aberta' : 'Fechada'} color={job.status === 'OPEN' ? 'success' : 'default'} variant="outlined" />
      </Box>
      <Typography variant="subtitle1" color="text.secondary" mb={1}>{job.company || 'Empresa desconhecida'} • {job.location || 'Remoto'}</Typography>
      {!!job.recruiter_email && !job.anonymous && (
        <Typography variant="caption" color="text.secondary" mb={2}>Contato do recrutador: {job.recruiter_email}</Typography>
      )}

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Descrição</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>{job.description}</Typography>
          {job.requirements && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Requisitos</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{job.requirements}</Typography>
            </>
          )}
          {job.salary && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Salário</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{job.salary}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Box display="flex" gap={2}>
        {user?.role === Role.CANDIDATE && job.status === 'OPEN' && (
          <Button variant="contained" onClick={handleApply} disabled={hasApplied}>{hasApplied ? 'Aplicado' : 'Aplicar'}</Button>
        )}
        {user?.role === Role.RECRUITER && (
          <Button variant="outlined" onClick={() => navigate(`/jobs/${jobId}/manage`)}>Gerenciar Vaga</Button>
        )}
        <Button variant="outlined" onClick={() => navigate('/jobs')}>Voltar para Vagas</Button>
      </Box>

      {user?.role === Role.RECRUITER && (
        <Card elevation={0} variant="outlined" sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Candidaturas</Typography>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <TextField
                label="Buscar candidato"
                placeholder="Nome ou ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
              />
              <TextField
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                select
                size="small"
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="REJECTED">Rejeitado</MenuItem>
                <MenuItem value="HIRED">Contratado</MenuItem>
              </TextField>
            </Box>
            {apps.length === 0 ? (
              <Typography color="text.secondary">Nenhuma candidatura ainda.</Typography>
            ) : (
              <Paper variant="outlined">
                <Box p={2}>
                  {apps
                    .filter((a) => !statusFilter || a.status === statusFilter)
                    .filter((a) => {
                      const term = search.trim().toLowerCase();
                      if (!term) return true;
                      const name = (a.candidate_name || '').toLowerCase();
                      const idMatch = String(a.candidate_id) === term;
                      return name.includes(term) || idMatch;
                    })
                    .map((a) => (
                    <Box key={a.id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                      <Box>
                        <Typography variant="subtitle2">{a.candidate_name || `Candidato #${a.candidate_id}`}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {a.candidate_id} • Aplicado em {a.applied_at}</Typography>
                      </Box>
                      <Chip label={a.status} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default JobDetails;
