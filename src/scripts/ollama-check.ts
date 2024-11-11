import 'dotenv/config';
import { Ollama } from "ollama";
import { getModels } from "../util/index.js";
import task from 'tasuku';
import chalk from 'chalk';

const models = await getModels({ provider: 'ollama' });
const ollama = new Ollama({ host: process.env.OLLAMA_HOST });

const download = false;

await task('Checking local models', async ({ task, setStatus, setOutput }) => {
  for (const model of models) {
    const modelName = model.model + (model.variant ? ':' + model.variant : '');
    await task(modelName, async (taskObj) => {
      await ollama.show({ model: modelName })
      .catch(() => {
        taskObj.setError(`Not found! 'ollama pull ${modelName}' to download`);
      })
    });
  }
});
