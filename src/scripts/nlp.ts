import winkNLP, { ItemToken } from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

import { getPosts, getLabelSet, keyBy } from '../util/index.js'
import { min } from 'drizzle-orm';
import jetpack from 'fs-jetpack';

const nlp = winkNLP(model, ['sbd', 'pos']);
const as = nlp.as;
const its = nlp.its;

const labels = keyBy(await getLabelSet({
  model: 'human',
  technique: 'human',
  variant: 'existing',
}), (l) => l.pid ?? 'none');

const documents = Object.fromEntries((await getPosts()).map(p => [ 
  p.id,
  p.title + '\n' + (p.text || p.url)
]));

const bagsOfWords: Record<string, Record<string, number>> = {};

for (const [id, doc] of Object.entries(documents)) {
  const docObj = nlp.readDoc(doc);
  const label = labels[id].label ?? 'none';

  const tokens = docObj
    .tokens()
    .filter(t => t.out(its.type) === 'word' && !t.out(its.stopWordFlag))
    .each((t: ItemToken) => {
      const term = t.out(its.normal);
      bagsOfWords[label] ??= {};
      bagsOfWords[label][term] ??= 0;
      bagsOfWords[label][term]++;
    });
}

const distinctWords = findDistinctWordsForEach(bagsOfWords, 5, 3);
jetpack.dir('output/nlp').write('distinct-words-existing.json', distinctWords);

function findDistinctWordsForEach(bagsOfWords: Record<string, Record<string, number>>, uniqueness = 10, min_appearances = 2) {
  const distinctWords: Record<string, Record<string, number>> = {};
  const labels = Object.keys(bagsOfWords);
  const bags = Object.values(bagsOfWords);

  bags.forEach((bow, index) => {
    const distinctForThisBag: Record<string, number> = {};

    // Go through each word in the current Bag of Words
    for (const word in bow) {
      const wordCountInCurrent = bow[word];
      let totalInOthers = 0;
      let otherBagsCount = 0;

      // Calculate the frequency of the word in all other Bags of Words
      bags.forEach((otherBow, otherIndex) => {
        if (otherIndex !== index && otherBow[word] !== undefined) {
          totalInOthers += otherBow[word];
          otherBagsCount++;
        }
      });

      // Calculate average frequency of the word in other Bags
      const avgInOthers = otherBagsCount > 0 ? totalInOthers / otherBagsCount : 0;

      // Check if the word is significantly more frequent in the current Bag
      if ((wordCountInCurrent > min_appearances) && (wordCountInCurrent > avgInOthers * uniqueness)) {
        distinctForThisBag[word] = wordCountInCurrent;
      }
    }

    // Store distinct words for this document
    distinctWords[labels[index]] = distinctForThisBag;
  });

  return distinctWords;
}
