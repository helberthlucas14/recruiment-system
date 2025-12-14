import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Card, CardContent, Divider, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import api from '../../shared/lib/api';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import FeedbackDialog from '../components/dialogs/FeedbackDialog';
import type { Job, Application, PaginatedResponse } from '../../domain/types';
import { Role } from '../../domain/types';
import { useAuth } from '../context/useAuth';

const ManageJob: React.FC = () => {
  const { id } = useParams();
  const jobId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<number | ''>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openConfirmSave, setOpenConfirmSave] = useState<boolean>(false);
  const [openConfirmCancelEdit, setOpenConfirmCancelEdit] = useState<boolean>(false);
  const [openFeedback, setOpenFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    requirements: '',
    salary: '',
    status: 'OPEN' as Job['status'],
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const jobRes = await api.get<Job>(`/jobs/${jobId}`);
      setJob(jobRes.data);
      setForm({
        title: jobRes.data.title,
        description: jobRes.data.description,
        company: jobRes.data.company,
        location: jobRes.data.location,
        requirements: jobRes.data.requirements || '',
        salary: jobRes.data.salary || '',
        status: jobRes.data.status,
      });
      const appsRes = await api.get<PaginatedResponse<Application>>(`/jobs/${jobId}/applications`, { params: { page: 1, limit: 50 } });
      const list = appsRes.data?.data || [];
      setApps(list);
      const hired = list.find(a => a.status === 'HIRED');
      if (hired) {
        setSelectedCandidate(hired.candidate_id);
      }
    } catch {
      setError('Falha ao carregar dados da vaga');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!Number.isFinite(jobId)) return;
    fetchAll();
  }, [fetchAll, jobId]);

  const handleFinalize = async () => {
    setError('');
    setSuccess('');
    if (!selectedCandidate || typeof selectedCandidate !== 'number') {
      setError('Selecione um candidato para encerrar a vaga');
      return;
    }
    try {
      await api.post(`/jobs/${jobId}/finalize`, { candidate_id: selectedCandidate });
      setSuccess('Vaga encerrada e candidato contratado');
      setOpenFeedback(true);
      setFeedbackMessage('Vaga encerrada com sucesso');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Falha ao encerrar a vaga';
      setError(message);
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/jobs/${jobId}`, {
        title: form.title,
        description: form.description,
        company: form.company,
        location: form.location,
        requirements: form.requirements,
        salary: form.salary,
        status: form.status,
      });
      setSuccess('Vaga atualizada com sucesso');
      if (form.status === 'CLOSED') {
        setSelectedCandidate('');
      }
      setIsEditing(false);
      setOpenFeedback(true);
      setFeedbackMessage('Alterações salvas com sucesso');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Falha ao atualizar a vaga';
      setError(message);
    }
  };

  if (user?.role !== Role.RECRUITER) {
    navigate('/jobs');
    return null;
  }

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error && !job) return <Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;
  if (!job) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Gerenciar Vaga</Typography>
        <Chip label={form.status === 'OPEN' ? 'Aberta' : 'Fechada'} color={form.status === 'OPEN' ? 'success' : 'default'} variant="outlined" />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Dados da Vaga</Typography>
          <TextField fullWidth label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} margin="normal" disabled={!isEditing} />
          <TextField fullWidth label="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} margin="normal" disabled={!isEditing} />
          <TextField fullWidth label="Local" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} margin="normal" disabled={!isEditing} />
          <TextField fullWidth label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} margin="normal" multiline rows={4} disabled={!isEditing} />
          <TextField fullWidth label="Requisitos" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} margin="normal" multiline rows={3} disabled={!isEditing} />
          <TextField fullWidth label="Salário" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} margin="normal" disabled={!isEditing} />

          <FormControl fullWidth margin="normal" disabled={!isEditing}>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value as Job['status'] })}>
              <MenuItem value="OPEN">Aberta</MenuItem>
              <MenuItem value="PAUSED">Pausada</MenuItem>
              <MenuItem value="CLOSED">Fechada</MenuItem>
            </Select>
          </FormControl>

          <Box mt={2} display="flex" gap={2}>
            {!isEditing && (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>Editar</Button>
            )}
            {isEditing && (
              <>
                <Button variant="contained" color="primary" onClick={() => setOpenConfirmSave(true)}>Salvar Alterações</Button>
                <Button variant="outlined" color="inherit" onClick={() => setOpenConfirmCancelEdit(true)}>Cancelar</Button>
              </>
            )}
            <Button variant="outlined" onClick={() => navigate(`/jobs/${jobId}`)}>Voltar</Button>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" mb={2}>Encerrar Vaga com um Candidato</Typography>
          <Typography variant="body2" color="text.secondary">Selecione um candidato que aplicou para marcar como contratado e fechar a vaga.</Typography>
          <Divider sx={{ my: 2 }} />
          <FormControl fullWidth>
            <InputLabel>Candidato</InputLabel>
            <Select value={selectedCandidate} label="Candidato" onChange={(e) => setSelectedCandidate(Number(e.target.value))} disabled={form.status !== 'OPEN'}>
              {apps.map((a) => (
                <MenuItem key={a.id} value={a.candidate_id}>
                  {(a.candidate_name || a.candidate?.name || `Candidato #${a.candidate_id}`)} • {a.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box mt={2}>
            <Button variant="contained" color="success" disabled={form.status !== 'OPEN' || !selectedCandidate} onClick={handleFinalize}>Encerrar Vaga</Button>
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={openConfirmSave}
        title="Confirmar Salvar"
        content={<>Deseja salvar as alterações desta vaga?</>}
        onCancel={() => setOpenConfirmSave(false)}
        onConfirm={() => { setOpenConfirmSave(false); handleUpdate(); }}
        cancelText="Não"
        confirmText="Sim"
      />

      <ConfirmDialog
        open={openConfirmCancelEdit}
        title="Cancelar Edição"
        content={<>Deseja descartar alterações e sair do modo de edição?</>}
        onCancel={() => setOpenConfirmCancelEdit(false)}
        onConfirm={() => { setOpenConfirmCancelEdit(false); setIsEditing(false); if (job) { setForm({
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          requirements: job.requirements || '',
          salary: job.salary || '',
          status: job.status,
        }); } }}
        cancelText="Não"
        confirmText="Sim"
      />

      <FeedbackDialog
        open={openFeedback}
        title="Ação concluída"
        message={<>{feedbackMessage}</>}
        onClose={() => setOpenFeedback(false)}
      />
    </Container>
  );
};

export default ManageJob;
