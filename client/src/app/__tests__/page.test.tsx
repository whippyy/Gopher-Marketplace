import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { AuthContext } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import '@testing-library/jest-dom';
import type { User } from 'firebase/auth';

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));
jest.mock('../../../lib/firebase', () => ({
  auth: {},
}));

const mockUseRouter = useRouter as jest.Mock;
const mockSignOut = signOut as jest.Mock;

describe('Home component', () => {
  it('should render loading state initially', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <Home />
      </AuthContext.Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render login button when user is not authenticated', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );
    expect(screen.getByText('You need to log in to access the marketplace.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Login' })).toBeInTheDocument();
  });

  it('should render welcome message and user email when user is authenticated', () => {
    const mockUser = { email: 'test@umn.edu', emailVerified: true } as Partial<User>;
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );
    expect(screen.getByText('Welcome to Gopher Marketplace')).toBeInTheDocument();
    expect(screen.getByText('You are logged in!')).toBeInTheDocument();
    expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
  });

  it('should call router.push with "/login" when login button is clicked', () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go to Login' }));
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('should call router.push with correct paths when navigation buttons are clicked', () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    const mockUser = { email: 'test@umn.edu', emailVerified: true } as Partial<User>;
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse Listings' }));
    expect(push).toHaveBeenCalledWith('/listings');

    fireEvent.click(screen.getByRole('button', { name: 'Create Listing' }));
    expect(push).toHaveBeenCalledWith('/listings/create');

    fireEvent.click(screen.getByRole('button', { name: 'View Profile' }));
    expect(push).toHaveBeenCalledWith('/profile');
  });

  it('should call signOut and redirect to /login on sign out button click', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockSignOut.mockResolvedValue(undefined);
    const mockUser = { email: 'test@umn.edu', emailVerified: true } as Partial<User>;

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle sign out error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    const error = new Error('Sign out failed');
    mockSignOut.mockRejectedValue(error);
    const mockUser = { email: 'test@umn.edu', emailVerified: true } as unknown as User;

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <Home />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', error);
    });
    
    consoleErrorSpy.mockRestore();
  });
});
