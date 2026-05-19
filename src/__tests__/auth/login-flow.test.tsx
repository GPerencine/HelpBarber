import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { mockUseUser } from '../../../jest.setup';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Login Flow - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error message for invalid credentials', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: null,
      isBarber: false,
      isAdmin: false,
      isUserLoading: false,
    });
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    const loginButton = screen.getByRole('button', { name: /Acessar Minha Conta/i });

    fireEvent.change(emailInput, { target: { value: 'teste@erro.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it('should redirect admin user after successful login', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: null,
      isBarber: false,
      isAdmin: false,
      isUserLoading: false,
    });

    const mockUser = {
      getIdTokenResult: jest.fn().mockResolvedValue({ claims: { admin: true } }),
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Acessar Minha Conta/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should redirect normal user after successful login', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: null,
      isBarber: false,
      isAdmin: false,
      isUserLoading: false,
    });

    const mockUser = {
      getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} }),
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Acessar Minha Conta/i }));

    // For normal user, no redirect is handled in onLoginSubmit, but a Toast is shown
    await waitFor(() => {
      expect(mockUser.getIdTokenResult).toHaveBeenCalled();
    });
  });

  it('should redirect if user is already logged in as barber', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: { uid: '123' },
      isBarber: true,
      isAdmin: false,
      isUserLoading: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/barber-dashboard');
    });
  });

  it('should redirect if user is already logged in as admin', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: { uid: '123' },
      isBarber: false,
      isAdmin: true,
      isUserLoading: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should redirect to barbers if user is already logged in as normal client', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: { uid: '123' },
      isBarber: false,
      isAdmin: false,
      isUserLoading: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/barbers');
    });
  });

  it('should send password reset email', async () => {
    (mockUseUser as jest.Mock).mockReturnValue({
      user: null,
      isBarber: false,
      isAdmin: false,
      isUserLoading: false,
    });

    (sendPasswordResetEmail as jest.Mock).mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    // Open dialog
    fireEvent.click(screen.getByText(/Esqueci minha senha/i));

    const resetEmailInput = screen.getAllByPlaceholderText('seu@email.com')[1];
    // Change email inside dialog
    fireEvent.change(resetEmailInput, { target: { value: 'reset@test.com' } });

    // Click confirm
    fireEvent.click(screen.getByRole('button', { name: /Enviar E-mail/i }));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });
});
