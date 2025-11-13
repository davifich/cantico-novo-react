import { config } from 'dotenv';
import path from 'path';

// Este caminho é relativo a /backend/scripts, então ../../.env aponta para a raiz
const result = config({ path: path.resolve(__dirname, '../../.env') });

console.log('--- SCRIPT DE DEPURAÇÃO DO BACKEND ---');
console.log(`Caminho do .env sendo lido: ${path.resolve(__dirname, '../../.env')}`);
console.log('Resultado do carregamento do dotenv:', result);

console.log('--- Variáveis de Ambiente no process.env ---');
console.log('process.env.SUPABASE_URL: ', process.env.SUPABASE_URL ? 'Definido ✓' : 'NÃO DEFINIDO ✗');
console.log('process.env.SUPABASE_ANON_KEY: ', process.env.SUPABASE_ANON_KEY ? 'Definido ✓' : 'NÃO DEFINIDO ✗');

if (result.error) {
  console.error('\n[ERRO] Ocorreu um erro ao analisar o arquivo .env:', result.error);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('\n[FALHA] Uma ou mais variáveis de ambiente necessárias não foram encontradas após o carregamento.');
  console.log('Por favor, verifique se o arquivo .env na raiz do projeto contém EXATAMENTE as seguintes linhas, sem espaços ou aspas extras:');
  console.log('SUPABASE_URL=seu_valor');
  console.log('SUPABASE_ANON_KEY=seu_valor');
  process.exit(1);
} else {
  console.log('\n[SUCESSO] Ambiente parece estar configurado corretamente!');
}
