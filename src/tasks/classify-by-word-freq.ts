// Create a bag of words for each label using the control documents
// For each remaining document, measure the similarity for each lael's bag of words
// Check its rank against the main category

import { getLabels, getLabelSet, getPosts } from "../util/index.js";
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-model';

const nlp = new winkNLP(model);
const its = nlp.its;

const posts = await getPosts();
const labels = await getLabels({
  model: 'human',
  variant: 'existing',
});
const postLabels = await getLabelSet({
  model: 'human',
  technique: 'human',
  variant: 'existing',
});

