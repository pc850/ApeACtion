
import { supabase } from '@/integrations/supabase/client';

export const signInExistingUser = async (address: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: `${address}@ton.wallet`,
    password: address,
  });
  
  if (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signUpNewUser = async (address: string, telegramUsername?: string | null) => {
  const { error } = await supabase.auth.signUp({
    email: `${address}@ton.wallet`,
    password: address,
    options: {
      data: {
        wallet_address: address,
        telegram_username: telegramUsername || null,
      }
    }
  });
  
  if (error) {
    console.error("Sign up error:", error);
    throw error;
  }
  
  // After successful signup, sign in
  await signInExistingUser(address);
};

export const checkUserExists = async (address: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', `ton_${address}`)
    .maybeSingle();
  
  if (error) {
    console.error("Error checking for existing user:", error);
    throw error;
  }
  
  return !!data;
};

export const signInWithTON = async (address: string, telegramUsername?: string | null) => {
  try {
    console.log("Signing in with address:", address, "Telegram:", telegramUsername);
    
    // Check if user exists first
    const userExists = await checkUserExists(address);
    
    // If user exists, sign in, otherwise sign up
    if (userExists) {
      console.log("User exists, signing in");
      await signInExistingUser(address);
      
      // Update telegram username if provided
      if (telegramUsername) {
        await updateUserTelegramUsername(address, telegramUsername);
      }
    } else {
      console.log("User doesn't exist, creating new account");
      await signUpNewUser(address, telegramUsername);
    }
    
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export const updateUserTelegramUsername = async (address: string, telegramUsername: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_username: telegramUsername })
      .eq('username', `ton_${address}`);
    
    if (error) {
      console.error("Error updating Telegram username:", error);
    }
  } catch (error) {
    console.error("Error updating user Telegram username:", error);
  }
};

export const signOut = async () => {
  return supabase.auth.signOut();
};
