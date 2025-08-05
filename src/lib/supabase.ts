import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://obyqqnjnztvwgxdxiwgf.supabase.co";
const supabaseAnonKey = "sb_publishable_NWS4Ln4E0ijuJsYNc0SAYg_fmt-F6r3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 