import { distance, similarity } from "ml-distance";
import { dot } from 'mathjs';

export const dist = distance.euclidean;
// export const dist = distance.manhattan;
// export const dist = (a: number[], b: number) => distance.minkowski(a, b, 3);
// export const dist = (a: number[], b: number[]) => 1 - similarity.cosine(a, b);
// export const dist = distance.intersection;
// export const dist = dot;