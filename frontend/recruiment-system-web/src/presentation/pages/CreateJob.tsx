import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, FormControlLabel, Switch } from '@mui/material';
import { useToast } from '../context/toastBase';
import api from '../../data/api';
import { useNavigate } from 'react-router-dom';

const CreateJob: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [requirements, setRequirements] = useState('');
    const [salary, setSalary] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const { showToast } = useToast();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/jobs', { title, description, company, location, requirements, salary, anonymous });
            showToast({ message: 'Vaga criada com sucesso', severity: 'success' });
            navigate('/jobs');
        } catch (err: unknown) {
            const serverMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
            const msg = serverMsg || 'Falha ao criar vaga.';
            setError(msg);
            showToast({ message: msg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">Criar Nova Vaga</Typography>
                <Button variant="outlined" onClick={() => navigate('/jobs')}>Voltar para Minhas Vagas</Button>
            </Box>
            <Paper sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Título da Vaga"
                        margin="normal"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Empresa"
                        margin="normal"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Local"
                        margin="normal"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Descrição"
                        margin="normal"
                        required
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Requisitos (Opcional)"
                        margin="normal"
                        multiline
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Faixa Salarial (Opcional)"
                        margin="normal"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                    />

                    <FormControlLabel
                        control={<Switch checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />}
                        label="Vaga anônima"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Publicando...' : 'Criar Vaga'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateJob;
