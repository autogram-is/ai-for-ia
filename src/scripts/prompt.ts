import chalk from 'chalk';
import sparkly from 'sparkly';
import task from 'tasuku';
import * as database from '../db/index.js';
import { labelByPrompt } from '../tasks/label-by-prompt.js';
import { getModel, getModels } from '../util/get-models.js';
import { Progress, ProgressStyles } from '../util/progress-bar.js';

// High-scoring models: ['gpt-4o-mini', 'qwen25-large', 'llama31-large', 'gemini-small, 'gemma2']

let models = await getModels({
  ids: ['gemma2', 'llama31-large', 'qwen25-large', 'gpt-4o-mini', 'gemini-small']
});

const variant = 'proposed';

const overall = new Progress({
  total: models.length,
  style: ProgressStyles.ascii,
  width: 20,
});

const bar = new Progress({
  style: ProgressStyles.hfill.map(c => chalk.bgWhiteBright.blackBright(c)),
});

await task('Labeling by prompt', async ({ task, setStatus }) => {
  for (const model of models) {
    overall.completed++;
    setStatus(`${overall.completed} of ${overall.total}`);

    await task(model.label, async ({ setTitle, setStatus, setOutput }) => {
      setTitle(bar.bar());
      setStatus(model.label);

      labelByPrompt.progress.on(
        'progress',
        (data: { total: number; current: number }) => {
          bar.total = data.total;
          bar.completed = data.current;
          setTitle(bar.bar());
        },
      );
      labelByPrompt.progress.on('done', () => {
        labelByPrompt.progress.clearListeners();
        setTitle(model.label);
        setStatus(undefined);
      });

      // Actually do the build
      const results = await labelByPrompt(model.id, {
        labels: variant,
        rebuild: false,
      });
      if (results) {
        setOutput(sparkly(results));
      }
      database.log(`Labeled posts using prompted ${model}`);
    });

    setStatus(undefined);
  }
});
