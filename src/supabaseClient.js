import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

const hasValidCredentials = isURL(supabaseUrl) && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' && 
  supabaseAnonKey !== 'tu-anon-key-de-supabase';

if (!hasValidCredentials) {
  console.warn(
    'Supabase no está configurado o tiene valores por defecto. La aplicación usará datos locales de respaldo.'
  );
}

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
