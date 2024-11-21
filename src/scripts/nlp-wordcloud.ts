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

const documents = (await getPosts()).map(d => ({
  id: d.id,
  label: labels[d.id].label || 'none',
  title: d.title,
  text: d.text,
}));

for (const l of Object.values(labels)) {
  const words = documents.filter(d => d.text && (d.label === l.label))
    .map(d => `${d.title.toLocaleLowerCase()}\n${d.text.replaceAll(/(\\n\s*)+/g, '\n').trim().toLocaleLowerCase()}`)
    .join('\n\n');
  jetpack.dir('output/nlp/raw').write(l.label?.toLocaleLowerCase().replaceAll(' ', '-') + '.txt', words);
}
