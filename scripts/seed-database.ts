
import { initDatabase, addCategory, addSong } from '../lib/database.node';
import { ClamorCategory, ClamorMusicas } from '../data/clamor';
import { LouvoresAvulsosCategory, LouvoresAvulsosMusicas } from '../data/louvores_avulsos';

async function seed() {
  console.log('Iniciando o processo de seeding do banco de dados...');
  await initDatabase();

  // Processa a categoria Clamor e suas músicas
  try {
    console.log('Adicionando categoria Clamor...');
    const clamorCategoryId = await addCategory(ClamorCategory);

    console.log('Adicionando músicas de Clamor...');
    for (const song of ClamorMusicas) {
      if (!song.title || !song.letra) continue; // Pula músicas vazias
      await addSong({ ...song, letra: song.letra, category_ids: [clamorCategoryId] });
    }

  } catch (error) {
    console.error('Erro ao processar a categoria Clamor:', error);
  }

  // Processa a categoria Louvores Avulsos e suas músicas
  try {
    console.log('Adicionando categoria Louvores Avulsos...');
    const avulsosCategoryId = await addCategory(LouvoresAvulsosCategory);

    console.log('Adicionando ou atualizando louvores avulsos...');
    for (const song of LouvoresAvulsosMusicas) {
      if (!song.title || !song.letra) continue; // Pula músicas vazias
      await addSong({ ...song, letra: song.letra, category_ids: [avulsosCategoryId] });
    }

  } catch (error) {
    console.error('Erro ao processar louvores avulsos:', error);
  }

  console.log('Seeding do banco de dados concluído!');
}

seed().catch(error => {
  console.error('Erro fatal durante o seeding do banco de dados:', error);
});
