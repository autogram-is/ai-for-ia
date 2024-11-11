import { similarity } from 'ml-distance';

interface measurable {
  id: string;
  vector: number[];
}

export function closest(
  item: measurable,
  neighbors: measurable[] = [],
  distance: (p: number[], q: number[]) => number = similarity.cosine,
  mode: 'similarity' | 'distance' = 'similarity',
): string {
  const sorted = neighbors.toSorted((a, b) => {
    const aDist = distance(a.vector as number[], item.vector as number[]);
    const bDist = distance(b.vector as number[], item.vector as number[]);
    if (aDist < bDist) {
      return -1;
    } else if (aDist > bDist) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  const closest = mode === 'similarity' ? sorted.pop() : sorted.shift();
  if (!closest) throw new Error('Could not find closest neighbor');
  return closest.id;
}
