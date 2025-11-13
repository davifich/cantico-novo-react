import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Caminho explícito e robusto para a raiz do projeto
config({ path: path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Falha ao carregar variáveis de ambiente. Verifique o arquivo .env na raiz do projeto.');
  console.error(`SUPABASE_URL encontrado: ${!!SUPABASE_URL}`);
  console.error(`SUPABASE_ANON_KEY encontrado: ${!!SUPABASE_ANON_KEY}`);
  throw new Error("⚠️  SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios!");
}

// ⚠️ Usando a CHAVE ANÔNIMA (ANON KEY).
export const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
