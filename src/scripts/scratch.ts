import winkNLP, { ItemToken } from 'wink-nlp';
import model from 'wink-eng-lite-web-model';


const nlp = winkNLP(model, ['sbd', 'pos']);
const as = nlp.as;
const its = nlp.its;


  const docObj = nlp.readDoc("What things outside of UX influence your design?");

console.log(docObj
    .tokens()
    .filter(t => t.out(its.type) === 'word' && !t.out(its.stopWordFlag))
    .out(its.normal));