import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Login from '../pages/Login';
import Register from '../pages/Register';
import JobDashboard from '../pages/JobDashboard';
import Home from '../pages/Home';
import Layout from '../components/Layout';
import { CircularProgress, Box } from '@mui/material';
import JobDetails from '../pages/JobDetails';
import CreateJob from '../pages/CreateJob';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    return !isAuthenticated ? <Outlet /> : <Navigate to="/jobs" replace />; // Redirect logged users to dashboard
};

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/jobs" element={<JobDashboard />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/create-job" element={<CreateJob />} />
                    <Route path="*" element={<Navigate to="/jobs" />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
