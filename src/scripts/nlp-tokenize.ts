import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

const text = 'What things outside of UX influence your design?';

const nlp = winkNLP(model, ['sbd', 'pos']);
const its = nlp.its;

const tokens = nlp
  .readDoc(text)
  .tokens()
  .filter(t => t.out(its.type) === 'word' && !t.out(its.stopWordFlag))

console.log(`Original sentence: "${text}"`);
console.log('Tokens: ', tokens.out(its.lemma));
console.log('Tokens IDs: ', tokens.out(its.uniqueId));
