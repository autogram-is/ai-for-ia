import sparkly from 'sparkly';
import task from 'tasuku';
import { compareLabelSets } from '../tasks/compare-labels.js';
import { Progress } from '../util';
import { getModels } from '../util/get-models.js';

const models = await getModels({
  embed: true
});

const progress = new Progress({ total: models.length });

await task('Compare labeling results', async ({ task, setStatus }) => {
  for (const model of models) {
    progress.completed++;
    setStatus(`${progress.completed} of ${progress.total}`);

    await task(model.label, async ({ setStatus, setOutput }) => {
      const prox = await compareLabelSets({
        model: model.id,
        technique: 'proximity',
        variant: 'existing',
      });
      if (prox.posts.length === 0) return;
      setStatus(`${prox.matches} matches, ${prox.errors} errors`);
      setOutput(
        sparkly(prox.histogram.old) + ' vs. ' + sparkly(prox.histogram.new),
      );
    });
  }
});
