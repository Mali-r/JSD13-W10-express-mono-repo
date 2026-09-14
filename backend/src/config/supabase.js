import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function connectSupabase() {
    try {
        
      const {error} = await supabase.from("users").select("id").limit(1); // Check ว่าติดต่อกันได้มั้ย ลองขอมา 1 ข้อมูล
      if (error) throw error
      console.log("Supabase connect ✅")

    } catch (error) {
        console.error("Supabase connection error🌋", error);
        throw error;
    }
}
