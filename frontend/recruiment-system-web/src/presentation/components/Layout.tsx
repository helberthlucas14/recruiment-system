import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../../domain/types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }} onClick={() => navigate('/')}>JobManager</Typography>

                    <Box>
                        {isAuthenticated ? (
                            <>
                                <Button color="inherit" onClick={() => navigate('/jobs')} sx={{ fontWeight: location.pathname === '/jobs' ? 'bold' : 'normal' }}>
                                    Vagas
                                </Button>
                                {user?.role === Role.CANDIDATE && (
                                    <Button color="inherit" onClick={() => navigate('/applications')} sx={{ fontWeight: location.pathname === '/applications' ? 'bold' : 'normal' }}>
                                        Minhas Candidaturas
                                    </Button>
                                )}
                                {user?.role === Role.RECRUITER && (
                                    <Button color="inherit" onClick={() => navigate('/create-job')} sx={{ fontWeight: location.pathname === '/create-job' ? 'bold' : 'normal' }}>
                                        Criar Vaga
                                    </Button>
                                )}
                                <Button color="inherit" onClick={handleLogout}>
                                    Sair
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" sx={{ mr: 2 }}>Sobre</Button>
                                <Button color="inherit" onClick={() => navigate('/login')}>Entrar</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Container maxWidth={false} sx={{ mt: 0, flex: 1, p: 0 }} disableGutters>
                {children}
            </Container>
        </Box>
    );
};

export default Layout;
