import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/useAuth.ts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/toastBase.ts';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
            navigate('/jobs');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Falha no login. Verifique suas credenciais.";
            setError(message);
            showToast({ message, severity: 'error' });
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Entrar no JobManager
                </Typography>
                <form onSubmit={handleLogin}>
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
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Entrar
                    </Button>
                    <Box textAlign="center">
                        <Button color="primary" onClick={() => navigate('/register')} sx={{ textTransform: 'none' }}>
                            Não tem conta? Cadastre-se
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
