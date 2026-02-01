const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL. Please set this to your Supabase project URL."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing required environment variable: EXPO_PUBLIC_SUPABASE_ANON_KEY. Please set this to your Supabase anon key."
  );
}

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  },
};
