import { nameCluster } from '../tasks/name-clusters.js';
import { getLabels } from '../util/get-labels.js';
import { getModel } from '../util/get-models.js';
import { getPrompt } from '../util/get-prompt.js';
import task from 'tasuku';
import { Progress, ProgressStyles } from '../util/progress-bar.js';
import chalk from 'chalk';

const model = await getModel('gemma2-large');
const prompt = await getPrompt('describe-cluster');
const labels = await getLabels({ variant: 'kmeans', 'model': 'llama33-large' });

const bar = new Progress({
  total: labels.length,
  style: ProgressStyles.hfill.map(c => chalk.bgWhiteBright.blackBright(c)),
});

await task('Naming clusters', async ({ task, setError, setStatus }) => {
  if (model === undefined) {
    setError(`Model not found`);
  } else if (prompt === undefined) {
    setError(`Prompt not found`);
  } else {
    await task(bar.bar(), async ({ setTitle, setStatus: localStatus }) => {
      setStatus(bar.completed + '/' + bar.total);

      nameCluster.progress.on(
        'progress',
        (data: { total: number }) => {
          bar.successes++;
          setStatus((bar.successes + '/' + bar.total) + (bar.failures ? ` (${bar.failures} errors)` : ''));
          setTitle(bar.bar());
        },
      );
      nameCluster.progress.on('failure', () => {
        bar.failures++;
        setStatus((bar.successes + '/' + bar.total) + (bar.failures ? ` (${bar.failures} errors)` : ''));
        setTitle(bar.bar());
      });
      await nameCluster(model, labels, prompt.text, true);
    })
  }  
});

