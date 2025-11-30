// config/supabase.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Supabase URL or Service Role Key is missing. Check your .env file.'
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
