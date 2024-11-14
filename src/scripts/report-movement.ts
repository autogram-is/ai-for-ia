import { visualizeMovement } from "../reports/sankey-compare.js";
import jetpack from "fs-jetpack";

let dir = jetpack.dir('output/movement/proposed');
for (const model of ['oai-text-mini', 'google-text', 'mxbai-query', 'minilm', 'smollm2', 'phi35']) {
  // Proximity
  let data = await visualizeMovement({ model, technique: 'proximity', variant: 'proposed' });
  dir.write('proximity-' + model + '.json', getData(data), { jsonIndent: 0});

  // Clustering
  data = await visualizeMovement({ model, technique: 'cluster', variant: 'kmeans' });
  dir.write('cluster-' + model + '.json', getData(data), { jsonIndent: 0});
}

// Prompting
for (const model of ['gemma2', 'llama31-large', 'qwen25-large', 'gpt-4o-mini', 'gemini-small']) {
  const data = await visualizeMovement({ model, technique: 'prompt', variant: 'proposed' });
  dir.write('prompt-' + model + '.json', getData(data), { jsonIndent: 0});
}


dir = jetpack.dir('output/movement/existing');
for (const model of ['oai-text-mini', 'google-text', 'mxbai-query', 'minilm']) {
  // Proximity
  let data = await visualizeMovement({ model, technique: 'proximity', variant: 'existing' });
  dir.write('proximity-' + model + '.json', getData(data), { jsonIndent: 0});
}

// Prompting
for (const model of ['gemma2', 'llama31-large', 'qwen25-large', 'gpt-4o-mini', 'gemini-small']) {
  const data = await visualizeMovement({ model, technique: 'prompt', variant: 'existing' });
  dir.write('prompt-' + model + '.json', getData(data), { jsonIndent: 0});
}

function getData(input: { source: string, target: string, value: number }[] = []) {
  const records = input.map(i => ({
    source: i.source, // Incredibly cheesy hack to get around duplicate in/out categories
    target: i.target,
    value: i.value,
  }));
  const output = new Set<string>();
  for (const i of input) {
    output.add(i.source);
    output.add(i.target);
  };
  return [
    ...output.values().map(s => ({ 
      category: s.replace(':', ''),
      labels: s.endsWith(':') ? 'left' : undefined,
      stack: s.endsWith(':') ? 0 : 1,
      sort: 0,
      gap: 0,
    })),
    ...records,
  ];
}