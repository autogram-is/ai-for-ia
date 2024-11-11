import type { LabelKey } from '../util/get-label-set.js';
import { getLabelSet } from '../util/get-label-set.js';
import { getPosts } from '../util/get-posts.js';

const existingHumanLabels: LabelKey = {
  model: 'human',
  technique: 'human',
  variant: 'existing',
};

export async function compareLabelSets(
  testGroup: LabelKey,
  controlGroup: LabelKey = existingHumanLabels,
) {
  const control = await getLabelSet(controlGroup);
  const test = await getLabelSet(testGroup);
  const posts = await getPosts();

  const merged = control.map(c => {
    const post = posts.find(p => p.id === c.pid);
    return {
      title: post?.title,
      comments: post?.comments,
      score: post?.score,
      old: c.lid,
      new: test.find(t => t.pid === c.pid)?.lid,
    };
  });

  return {
    posts: merged,
    matches: merged.filter(p => p.old && p.old === p.new).length,
    errors: merged.filter(p => !p.new).length,
    histogram: {
      old: Object.values(Object.groupBy(merged, m => m.old ?? 'none')).map(
        v => v?.length ?? 0,
      ),
      new: Object.values(Object.groupBy(merged, m => m.new ?? 'none')).map(
        v => v?.length ?? 0,
      ),
    },
  };
}
