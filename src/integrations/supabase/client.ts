// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kkddzgpenchcqjxyehep.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZGR6Z3BlbmNoY3FqeHllaGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODc4NjEsImV4cCI6MjA1NzM2Mzg2MX0.g0q6OWU9AdVRaYPP5xooKsPIWEmpdu40ZXx9qyOQS4g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);