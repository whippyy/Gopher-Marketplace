import { auth } from './firebase';

export async function authenticatedFetch(input: RequestInfo, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'Authorization': `Bearer ${token}`
    }
  });
} 