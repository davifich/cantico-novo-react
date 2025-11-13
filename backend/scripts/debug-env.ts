import { config } from 'dotenv';
import path from 'path';

const result = config({ path: path.resolve(__dirname, '../../.env') });

console.log('--- SCRIPT DE DEPURAÇÃO DO BACKEND ---');
console.log('Resultado do carregamento:', result.parsed ? 'Sucesso' : 'Falha');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Definido ✓' : 'Não definido ✗');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Definido ✓' : 'Não definido ✗');

if (!process.env.SUPABASE_URL || result.error) {
  console.error('\n[FALHA] Variáveis de ambiente não carregadas');
  process.exit(1);
} else {
  console.log('\n[SUCESSO] Ambiente configurado corretamente');
}
