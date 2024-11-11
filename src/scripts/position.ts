import chalk from 'chalk';
import task from 'tasuku';
import * as database from '../db/index.js';
import { mapToSpace } from '../tasks/map-to-space.js';
import { getModels } from '../util/get-models.js';
import { Progress, ProgressStyles } from '../util/progress-bar.js';

const models = await getModels({
  ids: ['oai-text-mini', 'google-text', 'mxbai-query', 'minilm']
});

const overview = new Progress({
  total: models.length,
  width: 20,
  style: ProgressStyles.ascii,
});

await task('Project embeddings to 2d/3d', async ({ task, setStatus }) => {
  for (const model of models) {
    overview.completed++;
    setStatus(`${overview.completed} of ${overview.total}`);

    const bar = new Progress({
      style: ProgressStyles.hfill.map(c => chalk.bgWhiteBright.blackBright(c)),
    });

    await task(model.label, async ({ setTitle, setStatus }) => {
      mapToSpace.progress.on(
        'progress',
        (data: { total: number; completed: number }) => {
          bar.total = data.total;
          bar.completed = data.completed;
          setTitle(bar.bar());
          setStatus(model.label);
        },
      );

      mapToSpace.progress.on('done', () => {
        bar.stop();
        setTitle(model.label);
        setStatus((bar.elapsedTime / 60000).toFixed(2) + ' minutes');
        bar.reset();
      });

      bar.start();
      await mapToSpace(model.id, true, 'pca');

      await database.log(`Generated 2d/3d points for ${model}`);
    });
  }
});
