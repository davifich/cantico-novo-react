
import { Music, Category } from '../types/music';

/**
 * Nova categoria para as músicas a serem adicionadas.
 */
export const ClamorCategory: Category = {
  id: 10, // ID único para esta nova categoria
  name: 'Clamor',
  color: '#3498DB', // Uma cor para identificar a categoria
};

/**
 * Este é um script esqueleto para adicionar novas músicas.
 * As músicas abaixo já estão associadas à 'ClamorCategory'.
 * Preencha os detalhes de cada música.
 * Certifique-se de que cada 'id' de música é único.
 */
export const ClamorMusicas: Music[] = [
  {
    id: 1, // Mantenha IDs de música únicos e sequenciais
    title: 'O Sangue de Jesus tem Poder',
    artist: '',
    cifra: null,
    file_path: null,
    has_cifra: false,
    has_partitura: false,
    category_ids: [ClamorCategory.id], // Referencia o ID da nova categoria
    status: 'pending',
    letra: `

O sangue de Jesus tem poder
Poder que a mim pode valer
Se comunhão não posso eu sentir, senhor
Derrama do teu sangue remidor
/
Derrama do teu sangue sobre mim
Ó senhor
Derrama do teu sangue sobre mim
Ó senhor
Sei que estás aqui e isto quero eu sentir
Derrama do teu sangue sobre mim
/
Em tua presença estou, senhor
De ti necessito muito amor
Pelo poder que há em teu sangue remidor
Ó vem purificar-me, meu senhor
/
Derrama do teu sangue sobre mim
Ó senhor
Derrama do teu sangue sobre mim
Ó senhor
Sei que estas aqui e isto quero eu sentir
Derrama do teu sangue sobre mim
    `,
  },
  {
    id: 2,
    title: 'O Sangue de Jesus tem Poder para Salvar',
    artist: '',
    cifra: null,
    file_path: null,
    has_cifra: false,
    has_partitura: false,
    category_ids: [ClamorCategory.id],
    status: 'pending',
    letra: `
o sangue de Jesus tem poder
o sangue de Jesus tem poder
o sangue de Jesus, o sangue de Jesus,
o sangue de Jesus tem poder
/
o sangue de Jesus tem poder para salvar
o sangue de Jesus tem poder para curar
o sangue de Jesus, o sangue de Jesus
tem poder para o oprimido libertar
    `,
  },
  {
    id: 3,
    title: 'Clamo a Ti',
    artist: '',
    cifra: null,
    file_path: null,
    has_cifra: false,
    has_partitura: false,
    category_ids: [ClamorCategory.id],
    status: 'pending',
    letra: `
Clamo a ti,ó meu senhor,
Clamo a ti, meu salvador,
Pelo teu sangue, que é vida,
Ó bendito, vem me libertar.
/
Clamo a ti,ó meu senhor,
Clamo a ti, meu salvador,
Pelo teu sangue, que é vida,
Ó bendito, vem me libertar.

Quando além do véu entrar,
Irei te dar todo o meu ser
Em tua presença, te adorar,
Te bendizer.

Clamo a ti,ó meu senhor,
Clamo a ti, meu salvador,
Pelo teu sangue, que é vida,
Ó bendito, vem me libertar.
    `,
  },
  // Adicione mais blocos de música aqui conforme necessário.
];
