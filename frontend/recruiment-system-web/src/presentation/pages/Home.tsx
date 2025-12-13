import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Box sx={{ bgcolor: 'background.paper', pt: 8, pb: 6 }}>
                <Container maxWidth="md">
                    <Typography component="h1" variant="h2" align="center" color="text.primary" gutterBottom>
                        Bem-vindo(a) ao JobManager
                    </Typography>
                    <Typography variant="h5" align="center" color="text.secondary" paragraph>
                        Encontre as melhores vagas ou contrate talentos com facilidade.
                    </Typography>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button variant="contained" size="large" onClick={() => navigate('/register')}>
                            Começar
                        </Button>
                        <Button variant="outlined" size="large">
                            Saiba mais
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container sx={{ py: 8 }} maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }} elevation={0}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Busca de Vagas Fácil
                            </Typography>
                            <Typography color="text.secondary">
                                Explore milhares de vagas feitas para você.
                            </Typography>
                        </Paper>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }} elevation={0}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Publique Vagas Rápido
                            </Typography>
                            <Typography color="text.secondary">
                                Empresas publicam vagas e gerenciam candidaturas com facilidade.
                            </Typography>
                        </Paper>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }} elevation={0}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Perfis Seguros
                            </Typography>
                            <Typography color="text.secondary">
                                Gerencie seu perfil com segurança e profissionalismo.
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Container>

            <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' JobManager. Todos os direitos reservados.'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    <Button color="inherit" size="small">Sobre</Button>
                    <Button color="inherit" size="small">Contato</Button>
                    <Button color="inherit" size="small">Privacidade</Button>
                </Typography>
            </Box>
        </Box>
    );
};

export default Home;
