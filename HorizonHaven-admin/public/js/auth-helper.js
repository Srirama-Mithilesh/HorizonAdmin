import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const VITE_SUPABASE_URL = 'https://fmvksqlpnutcjqadtslt.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdmtzcWxwbnV0Y2pxYWR0c2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzMyMjgsImV4cCI6MjA4MDAwOTIyOH0.MuoIMyfzrKNem5xCZuxWNMgeyQuC5IwY0RpeXIocPgg';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

export async function getAuthToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
}

export async function apiCall(endpoint, options = {}) {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    window.location.href = '/login';
    return null;
  }

  return response;
}

export { supabase };
