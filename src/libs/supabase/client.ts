import { createClient } from '@supabase/supabase-js';

import { IDatabase } from '@/models/interfaces/database.interface';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<IDatabase>(supabaseUrl, supabaseAnonKey);
