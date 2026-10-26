import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Vrai si les variables d'environnement Supabase sont renseignées. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Client Supabase partagé (null si non configuré : l'application
 * fonctionne alors en mode local, sans connexion ni sauvegarde).
 */
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
