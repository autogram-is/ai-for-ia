import { dist } from './global-distance.js';
import sparkly from 'sparkly';
import task from 'tasuku';
import { labelByCluster } from '../tasks/label-by-cluster.js';
import { getModels } from '../util/get-models.js';
import { Progress, ProgressStyles } from '../util/progress-bar.js';

const models = await getModels({
  embed: true
});

await task(
  'Locating and labeling clusters',
  async ({ task: parent, setStatus }) => {
    const progress = new Progress({
      total: models.length,
      width: 15,
      style: ProgressStyles.ascii,
    });

    setStatus(progress.bar());
    for (const model of models) {
      await parent(model.label, async ({ setStatus }) => {
        const output = await labelByCluster(model.id, {
          rebuild: true,
          algorithm: 'kmeans',
          kGroups: 7,
          kIterations: 100,
          dEpsilon: model.epsilon || undefined,
          distance: dist,
        });
        setStatus(sparkly(output));
      });
      progress.completed++;
      setStatus(`${progress.completed} of ${progress.total}`);
    }
  },
);
