import { config } from 'dotenv';

// Força o dotenv a procurar o arquivo .env na raiz do projeto
const result = config({ path: './.env' });

console.log('--- INICIANDO SCRIPT DE DEPURAÇÃO ---');
console.log('Resultado do carregamento do dotenv:', result);
console.log('Valor de SUPABASE_URL após o carregamento:', process.env.SUPABASE_URL);

if (!process.env.SUPABASE_URL || result.error) {
  console.error('\n[FALHA NA DEPURAÇÃO] Não foi possível carregar as variáveis de ambiente. Verifique o arquivo .env e as permissões.');
  process.exit(1);
} else {
  console.log('\n[SUCESSO NA DEPURAÇÃO] Variáveis de ambiente carregadas com sucesso! Prosseguindo...');
}

// Apenas se a depuração for bem-sucedida, tentamos importar o servidor
import './index';
