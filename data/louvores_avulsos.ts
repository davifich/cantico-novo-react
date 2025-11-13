import { AddSongDTO, Category } from '../types/music';

/**
 * Nova categoria para as músicas a serem adicionadas.
 */
export const LouvoresAvulsosCategory: Category = {
  id: 10,
  name: 'Louvores Avulsos',
  color: '#3498DB',
};

/**
 * Coleção completa de músicas de louvores avulsos para importação (seeding).
 * O tipo agora é AddSongDTO[], o campo 'id' foi substituído por 'code' e 'status' foi removido.
 */
export const LouvoresAvulsosMusicas: AddSongDTO[] = [
  {
    code: 'A01',
    title: 'A Tua Shekinah', 
    artist: '', 
    cifra: null,
    file_path: null, 
    has_cifra: false, 
    has_partitura: false,
    category_ids: [LouvoresAvulsosCategory.id], 
    letra: `
*Coro*
Ó senhor (Shekinah)
A ti, clamo (Shekinah)
Que nos mostres (Shekinah)
A tua Shekinah
Com tua glória (Shekinah)
Enche este lugar (Shekinah)
Com tua presença (Shekinah)
A tua Shekinah
/
Senhor, sei que me conheces
Quero andar em teu caminho
E encontrar o teu favor
/
Senhor, só tua presença
Pode me fazer descansar
Se não fores comigo
Eu não prosseguirei
Se andares comigo, o mundo saberá
Que te encontrei
Pois deste mundo, eu me separei
/
*Coro*
Ó senhor
A ti, clamo
Que nos mostres
A tua shekinah
Com tua glória
Enche este lugar
Com tua presença
A tua Shekinah
/
Ó senhor 
A ti, clamo
Que nos mostres 
A tua Shekinah
Com tua glória 
Enche este lugar 
Com tua presença 
A tua Shekinah
/
*Instrumentos*
/
*coro*
Ó senhor (Shekinah)
A ti, clamo (Shekinah)
Que nos mostres (Shekinah)
A tua Shekinah
Com tua glória (Shekinah)
Enche este lugar (Shekinah)
Com tua presença (Shekinah)
A tua Shekinah
/
Ó senhor 
A ti, clamo 
Que nos mostres 
A tua Shekinah
Com tua glória 
Enche este lugar 
Com tua presença 
A tua Shekinah
/
*Final*
Shekinah
Shekinah
    `,
  },
  {
    code: 'A02', 
    title: 'Varão de Guerra', 
    artist: '', 
    cifra: null, 
    file_path: null, 
    has_cifra: false, 
    has_partitura: false,
    category_ids: [LouvoresAvulsosCategory.id],
    letra: `
Varão de guerra é o Senhor
Que vai a frente do seu povo
Nas pelejas da alma nas provações
Nas lutas contra os nossos adversários
/
Varão de guerra é o Senhor
Que ergue a sua espada
E com labaredas de fogo
Toca nos seus ministros
E os torna capazes
Para as pelejas
/
Este é o meu Deus
Soberano em força e poder
O Único que se assenta no trono da glória
E que reinará eternamente
/
Este é meu Deus
Soberano em força e poder
Justo e cumpridor da sua palavra
Que nos prometeu um Rei Jesus
Para reinar sobre nós
Na cidade santa eternamente
    `,
  },

];
