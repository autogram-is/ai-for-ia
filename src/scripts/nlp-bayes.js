import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { getPosts, getLabelSet, keyBy } from '../util/index.js'
import Classifier from 'wink-naive-bayes-text-classifier';

const labels = keyBy(await getLabelSet({
  model: 'human',
  technique: 'human',
  variant: 'existing',
}), (l) => l.pid ?? 'none');

const posts = (await getPosts()).map(d => ({
  id: d.id,
  label: labels[d.id].label || undefined,
  title: d.title,
  text: d.text,
}));

var nbc = Classifier();
const nlp = winkNLP(model, ['sbd', 'pos']);
const its = nlp.its;

const prepTask = function ( text ) {
  const tokens = [];
  nlp.readDoc(text)
      .tokens()
      // Use only words ignoring punctuations etc and from them remove stop words
      .filter( (t) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
      // Handle negation and extract stem of the word
      .each( (t) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );

  return tokens;
};

nbc.definePrepTasks( [ prepTask ] );
nbc.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );

// Take half the posts for each category and split them;
// train the classifier on the first half and test on the second.

