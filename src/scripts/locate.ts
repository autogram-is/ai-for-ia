import chalk from 'chalk';
import task from 'tasuku';
import { labelByProximity } from '../tasks/label-by-proximity.js';
import { getModels } from '../util/get-models.js';
import { Progress, ProgressStyles } from '../util/progress-bar.js';
import { dist } from './global-distance.js';

const models = await getModels({
  ids: ['llama33-large']
});

const bar = new Progress({
  total: models.length,
  style: ProgressStyles.hfill.map(c => chalk.bgWhiteBright.blackBright(c)),
});

await task('Locate closest labels', async ({ setTitle, setStatus }) => {
  for (const model of models) {
    setStatus(model.label);
    setTitle(bar.bar());
    await labelByProximity(model.id, {
      rebuild: true,
      variant: 'existing',
      distance: dist
    });
    await labelByProximity(model.id, {
      rebuild: true,
      variant: 'proposed',
      distance: dist,
    });
    bar.completed++;
  }
  setTitle('Locate closest labels');
  setStatus();
});
