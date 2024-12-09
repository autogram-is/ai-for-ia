import { visualizeEmbeddings } from "../reports/visualize-embeddings.js"
import jetpack from "fs-jetpack";

const dir = jetpack.dir('output/clusters');

for (const model of ['llama33-large']) {
  const data = await visualizeEmbeddings(model);
  dir.write(model + '.json', data, { jsonIndent: 0 });
}