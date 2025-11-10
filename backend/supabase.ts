import { createClient } from '@supabase/supabase-js';

// ⚠️ Aqui usamos a CHAVE DE SERVIÇO (apenas no backend)
export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);
