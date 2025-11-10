
import { Music } from '@/types/music';

/**
 * Dados de teste para músicas. 
 * IMPORTANTE: Esta estrutura deve corresponder exatamente à interface `Music`.
 */
export const mockSongs: Music[] = [
  {
    id: 1,
    title: 'Amazing Grace',
    artist: 'John Newton',
    letra: `Amazing grace, how sweet the sound, that saved a wretch like me...`,
    cifra: `[G]Amazing [C]grace, how [G]sweet the [D]sound...`,
    has_cifra: true,
    has_partitura: false,
    file_path: null,
    category_ids: [1, 3], // Ex: Hinário, Adoração
  },
  {
    id: 2,
    title: 'How Great Thou Art',
    artist: 'Carl Boberg',
    letra: `O Lord my God, when I in awesome wonder, consider all the worlds Thy hands have made...`,
    cifra: `[A]O Lord my [D]God, when [A]I in awesome [E]wonder...`,
    has_cifra: true,
    has_partitura: true,
    file_path: '/path/to/how-great-thou-art.pdf',
    category_ids: [1, 2], // Ex: Hinário, Clássicos
  },
  {
    id: 3,
    title: '10,000 Reasons (Bless the Lord)',
    artist: 'Matt Redman',
    letra: `Bless the Lord, O my soul, O my soul, worship His holy name...`,
    cifra: null, // Exemplo sem cifra
    has_cifra: false,
    has_partitura: false,
    file_path: null,
    category_ids: [3, 4], // Ex: Adoração, Contemporâneo
  },
  {
    id: 4,
    title: 'In Christ Alone',
    artist: 'Keith Getty, Stuart Townend',
    letra: `In Christ alone my hope is found, He is my light, my strength, my song...`,
    cifra: `[D]In Christ a[G]lone my [D]hope is [A]found...`,
    has_cifra: true,
    has_partitura: false,
    file_path: null,
    category_ids: [1, 3, 4],
  },
  {
    id: 5,
    title: 'What a Beautiful Name',
    artist: 'Hillsong Worship',
    letra: `You were the Word at the beginning, one with God the Lord Most High...`,
    cifra: `[D]You were the [A]Word at the be[Bm]ginning...`,
    has_cifra: true,
    has_partitura: false,
    file_path: null,
    category_ids: [3, 4],
  },
  {
    id: 12, // Mantendo ID para consistência com o erro original
    title: 'Goodness of God',
    artist: 'Bethel Music',
    letra: `I love You Lord, oh Your mercy never fails me...`,
    cifra: `[C]I love You Lord, oh Your [G]mercy never fails me...`,
    has_cifra: true,
    has_partitura: false,
    file_path: null,
    category_ids: [3, 4], // Ex: Adoração, Contemporâneo
  },
];
