import chalk from 'chalk';
import task from 'tasuku';
import * as database from '../db/index.js';
import { generateEmbeddings } from '../tasks/generate-embeddings.js';
import { getLabels } from '../util/get-labels.js';
import { getModels } from '../util/get-models.js';
import { getPosts } from '../util/get-posts.js';
import { Progress, ProgressStyles } from '../util/progress-bar.js';

const models = await getModels({
  ids: ['llama33-large']
});

const documents: Record<string, string> = {};

const existing = await getLabels({ model: 'human', variant: 'existing' });
const proposed = await getLabels({ model: 'human', variant: 'proposed' });
const posts = await getPosts();

for (const l of [...existing, ...proposed, ...posts]) {
  documents[l.id] = `${l.title}\n\n${l.text}`;
}

const overall = new Progress({
  total: models.length,
  style: ProgressStyles.ascii,
  width: 20,
});

const bar = new Progress({
  total: Object.values(documents).length,
  style: ProgressStyles.hfill.map(c => chalk.bgWhiteBright.blackBright(c)),
});

await task('Generating embeddings', async ({ task, setStatus }) => {
  for (const model of models) {
    overall.completed++;
    setStatus(`${overall.completed} of ${overall.total}`);

    database.log(`Generating embeddings with ${model.id}`);

    await task(model.label, async ({ setTitle, setStatus }) => {
      setTitle(bar.bar());
      setStatus(model.label);

      generateEmbeddings.progress.on(
        'progress',
        (data: { total: number; current: number }) => {
          bar.total = data.total;
          bar.completed = data.current;
          setTitle(bar.bar());
        },
      );
      generateEmbeddings.progress.on('done', () => {
        generateEmbeddings.progress.clearListeners();
        bar.stop();
        setTitle(model.label);
        setStatus((bar.elapsedTime / 60000).toFixed(2) + ' minutes');
        bar.reset();
      });

      bar.start();
      return await generateEmbeddings(model, documents, false);
    });

    setStatus(undefined);
  }
  return;
});
