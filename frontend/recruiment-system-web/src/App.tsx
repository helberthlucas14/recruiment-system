import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppRouter from './presentation/router/AppRouter';
import { ToastProvider } from './presentation/context/ToastContext';
import { AuthProvider } from './presentation/context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3B82F6' },
    secondary: { main: '#6366F1' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#0EA5E9' },
    background: { default: '#F7FAFC', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained' },
      styleOverrides: {
        root: { borderRadius: 8 },
        contained: { boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiAlert: {
      defaultProps: { variant: 'outlined' },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
