// src/utils/assign.ts
export type Player = { id: number; name: string; role?: 'civil'|'impostor'; word?: string };

export function assignRolesAndWords(players: Player[], impostorCount: number, packWords: string[]): Player[] {
  const N = players.length;
  if (impostorCount >= N) throw new Error('Impostores devem ser menos que jogadores');

  // palavra dos civis
  const civWord = packWords[Math.floor(Math.random() * packWords.length)];
  // palavra dos impostores (garantindo diferente)
  let impWord = packWords[Math.floor(Math.random() * packWords.length)];
  if (impWord === civWord) {
    const alt = packWords.find(w => w !== civWord);
    if (alt) impWord = alt;
  }

  // escolhe índices aleatórios para impostores
  const indices = Array.from({ length: N }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const impostorIndices = new Set(indices.slice(0, impostorCount));

  return players.map((p, idx) => ({
    ...p,
    role: impostorIndices.has(idx) ? 'impostor' : 'civil',
    word: impostorIndices.has(idx) ? impWord : civWord
  }));
}
