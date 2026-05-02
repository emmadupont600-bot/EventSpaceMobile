import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lmmadyvzbzeafriyeseg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYnNlIiwicmVmIjoibG1tYWR5dnpiemVhZnJpeWVzZWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzczNTA0MywiZXhwIjoyMDkzMzExMDQzfQ.tZeGgUBkkRJqG1e3CejbODxlH-m7oLFrkSfCNIqBCgg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
