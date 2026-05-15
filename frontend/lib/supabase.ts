import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Khởi tạo client dùng chung cho toàn app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
