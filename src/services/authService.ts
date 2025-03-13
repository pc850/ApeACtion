
import { supabase } from '@/integrations/supabase/client';

// Basic authentication methods without TON wallet integration
export const signOut = async () => {
  return supabase.auth.signOut();
};

// The TON wallet authentication has been completely removed
export const signInWithTON = async () => {
  console.warn('TON wallet authentication has been removed from this application.');
  return false;
};

export const signInExistingUser = async () => {
  console.warn('TON wallet authentication has been removed from this application.');
};

export const signUpNewUser = async () => {
  console.warn('TON wallet authentication has been removed from this application.');
};

export const checkUserExists = async () => {
  console.warn('TON wallet authentication has been removed from this application.');
  return false;
};
