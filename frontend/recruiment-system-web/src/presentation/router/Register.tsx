import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Alert, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { useAuth } from '../context/useAuth.ts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/toastBase.ts';
import { Role } from '../../domain/types';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.CANDIDATE);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register({ name, email, password, role });
            showToast({ message: 'Cadastro realizado! Faça login.', severity: 'success' });
            navigate('/login');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Falha no cadastro.";
            setError(message);
            showToast({ message, severity: 'error' });
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450 }}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Criar Conta
                </Typography>
                <form onSubmit={handleRegister}>
                    <TextField
                        label="Nome Completo"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextField
                        label="E-mail"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Senha"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        helperText="Digite uma senha forte"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Perfil</InputLabel>
                        <Select
                            value={role}
                            label="Perfil"
                            onChange={(e) => setRole(e.target.value as Role)}
                        >
                            <MenuItem value={Role.CANDIDATE}>Candidato</MenuItem>
                            <MenuItem value={Role.RECRUITER}>Recrutador</MenuItem>
                        </Select>
                    </FormControl>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Cadastrar
                    </Button>
                    <Box textAlign="center">
                        <Button color="primary" onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
                            Já tem conta? Entrar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Register;
