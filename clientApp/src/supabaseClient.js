import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twrxuwsxcbpqjlnylnqn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3cnh1d3N4Y2JwcWpsbnlsbnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNzM2NDYsImV4cCI6MjA1MjY0OTY0Nn0.1aMt0WNraQFvKD42titoSNfs0Jfjtcpuwo_uBbwd1Ds';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 