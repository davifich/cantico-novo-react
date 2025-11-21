/**
 * backend/supabase/server-client.ts
 */

import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Carrega o arquivo .env na raiz do projeto
config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === "test" ? "../.env.test" : "../.env"
  ),
});

// Carrega variáveis
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Valida variáveis obrigatórias
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Erro ao carregar variáveis de ambiente do Supabase:");
  console.error(`SUPABASE_URL: ${SUPABASE_URL ? "OK" : "NÃO ENCONTRADO"}`);
  console.error(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? "OK" : "NÃO ENCONTRADO"}`);
  throw new Error("SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios.");
}

// Cria cliente Supabase para uso no backend (apenas ANON KEY)
export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});
