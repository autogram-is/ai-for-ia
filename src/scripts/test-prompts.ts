import { Ollama } from 'ollama';
import { getPost } from '../util/get-posts.js';

const post = await getPost('so7pn5V4');
if (post) {
  const oll = new Ollama();
  await oll.embed({
    model: 'bge-large',
    input: post.title + '\n' + (post?.text || ''),
    truncate: true,
    options: { embedding_only: true }
  });
}
