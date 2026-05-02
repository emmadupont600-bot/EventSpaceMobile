import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lmmadyvzbzeafriyeseg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbWFkeXZ6YnplYWZyaXllc2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzUwNDMsImV4cCI6MjA5MzMxMTA0M30.tZeGgUBkkRJqG1e3CejbODxlH-m7oLFrkSfCNIqBCgg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
