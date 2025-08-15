import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '../page';
import { AuthContext } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../../../lib/api';
import '@testing-library/jest-dom';
import type { User } from 'firebase/auth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../../lib/api', () => ({
  authenticatedFetch: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockAuthenticatedFetch = authenticatedFetch as jest.Mock;

const mockUser = {
  email: 'gopher@umn.edu',
  displayName: 'Goldy Gopher',
} as unknown as User;

const mockListings = [
  { id: 1, title: 'Calculus Textbook', price: 50, createdAt: new Date().toISOString() },
  { id: 2, title: 'Lab Goggles', price: 10, createdAt: new Date().toISOString() },
];

describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock window functions
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  it('should render loading state when auth is loading', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <ProfilePage />
      </AuthContext.Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render login message when user is not authenticated', () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <ProfilePage />
      </AuthContext.Provider>
    );
    expect(screen.getByText('You must be logged in to view your profile.')).toBeInTheDocument();
  });

  it('should display user profile and listings when authenticated', async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockAuthenticatedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockListings),
    });

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    // Check for profile info
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(mockUser.displayName!, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('(gopher)')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email!)).toBeInTheDocument();

    // Check for listings loading state
    expect(screen.getByText('Loading your listings...')).toBeInTheDocument();

    // Wait for listings to appear
    await waitFor(() => {
      expect(screen.getByText('Calculus Textbook')).toBeInTheDocument();
      expect(screen.getByText('Lab Goggles')).toBeInTheDocument();
    });

    // Check that loading text is gone
    expect(screen.queryByText('Loading your listings...')).not.toBeInTheDocument();
    
    // Check for listing details
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2);
  });

  it('should display a message when user has no listings', async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockAuthenticatedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('You have not created any listings yet.')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching listings fails', async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockAuthenticatedFetch.mockRejectedValue(new Error('API Error'));

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Could not load your listings.')).toBeInTheDocument();
    });
  });

  it('should navigate to the edit page when edit button is clicked', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockAuthenticatedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockListings),
    });

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    const editButtons = await screen.findAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);

    expect(push).toHaveBeenCalledWith('/listings/1/edit');
  });

  it('should delete a listing after confirmation', async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockAuthenticatedFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockListings) });
    mockAuthenticatedFetch.mockResolvedValueOnce({ ok: true });

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false }}><ProfilePage /></AuthContext.Provider>
    );

    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this listing? This action cannot be undone.');
    await waitFor(() => expect(mockAuthenticatedFetch).toHaveBeenCalledWith(expect.stringContaining('/api/listings/1'), { method: 'DELETE' }));
    await waitFor(() => expect(screen.queryByText('Calculus Textbook')).not.toBeInTheDocument());
    expect(screen.getByText('Lab Goggles')).toBeInTheDocument();
  });
});

