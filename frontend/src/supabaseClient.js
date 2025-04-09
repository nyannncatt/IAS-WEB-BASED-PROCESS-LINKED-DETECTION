// src/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jwrbasvghttrkbxqenst.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cmJhc3ZnaHR0cmtieHFlbnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjg1NzIsImV4cCI6MjA1OTc0NDU3Mn0.giUZnfJ8vwgxL56xlP8fMAEBYDNbiXBodPSXMYyj0JE"; // Replace with your Supabase anonymous key

export const supabase = createClient(supabaseUrl, supabaseKey);