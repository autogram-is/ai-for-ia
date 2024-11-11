import { visualizeMovement } from "../reports/sankey-compare.js";
import { csv } from "../util/serializers.js";
import jetpack from "fs-jetpack";

// Ultra jank, but it works.
const csvHeader = '"source","target","value"';
const mermaidHeader = `---
config:
  sankey:
    showValues: false
---
sankey-beta`;

let dir = jetpack.dir('output/movement/proposed');
for (const model of ['oai-text-mini', 'google-text', 'mxbai-query', 'minilm']) {
  // Proximity
  let data = await visualizeMovement({ model, technique: 'proximity', variant: 'proposed' });
  dir.write('proximity-' + model + '.csv', csv.stringify(data, { quoted_string: true }).replace(csvHeader, mermaidHeader));

  // Clustering
  data = await visualizeMovement({ model, technique: 'cluster', variant: 'kmeans' });
  dir.write('cluster-' + model + '.csv', csv.stringify(data, { quoted_string: true }).replace(csvHeader, mermaidHeader));
}

// Prompting
for (const model of ['gemma2', 'llama31-large', 'qwen25-large', 'gpt-4o-mini', 'gemini-small']) {
  const data = await visualizeMovement({ model, technique: 'prompt', variant: 'proposed' });
  dir.write('prompt-' + model + '.csv', csv.stringify(data, { quoted_string: true }).replace(csvHeader, mermaidHeader));
}


dir = jetpack.dir('output/movement/existing');
for (const model of ['oai-text-mini', 'google-text', 'mxbai-query', 'minilm']) {
  // Proximity
  let data = await visualizeMovement({ model, technique: 'proximity', variant: 'existing' });
  dir.write('proximity-' + model + '.csv', csv.stringify(data, { quoted_string: true }).replace(csvHeader, mermaidHeader));
}

// Prompting
for (const model of ['gemma2', 'llama31-large', 'qwen25-large', 'gpt-4o-mini', 'gemini-small']) {
  const data = await visualizeMovement({ model, technique: 'prompt', variant: 'existing' });
  dir.write('prompt-' + model + '.csv', csv.stringify(data, { quoted_string: true }).replace(csvHeader, mermaidHeader));
}


