// Importá el cliente de Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔑 Reemplazá con tus datos reales de proyecto
const SUPABASE_URL = "https://ejsjcdjitszfzjeyujuf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqc2pjZGppdHN6ZnpqZXl1anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjAzMjYsImV4cCI6MjA2NzczNjMyNn0.ZM8sPxZ9Z5pz7vQXZq-4lXF1g77Y5yfwSITBG8eWNoE"; // Clave pública del proyecto

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);