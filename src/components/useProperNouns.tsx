import {useState, useEffect} from 'react';

// Import wink-nlp and the pre-trained English language model
import winkNLP from 'wink-nlp';
const model = require('wink-eng-lite-web-model');

// Initialize the winkNLP instance with the model
const nlp = winkNLP(model);

// Function to detect and combine proper nouns in the text
const detectProperNouns = text => {
  const doc = nlp.readDoc(text);
  console.log('Full document:', doc.out());
  console.log('Tokens:', doc.tokens().out());
  console.log('Sentences:', doc.sentences().out());

  const its = nlp.its;
  const tokens = doc.tokens().out();
  const posTags = doc.tokens().out(its.pos);
  console.log('POS tags:', posTags);

  // Combine tokens with their POS tags
  const tokenWithPOSTags = tokens.map((token, index) => ({
    text: token,
    pos: posTags[index],
  }));

  console.log('Tokens with POS tags:', tokenWithPOSTags);

  // Filter and combine proper nouns
  const properNouns = [];
  let currentProperNoun = '';

  tokenWithPOSTags.forEach((token, index) => {
    if (token.pos === 'PROPN') {
      if (currentProperNoun) {
        currentProperNoun += ' ' + token.text;
      } else {
        currentProperNoun = token.text;
      }
    } else {
      if (currentProperNoun) {
        properNouns.push({text: currentProperNoun, type: 'PROPN'});
        currentProperNoun = '';
      }
    }
  });

  // Push the last proper noun if any
  if (currentProperNoun) {
    properNouns.push({text: currentProperNoun, type: 'PROPN'});
  }

  console.log('Proper nouns:', properNouns);

  // Return proper nouns
  return properNouns;
};

const useProperNouns = journalEntry => {
  const [properNouns, setProperNouns] = useState([]);

  useEffect(() => {
    if (journalEntry) {
      const detectedProperNouns = detectProperNouns(journalEntry);
      console.log('Detected proper nouns:', detectedProperNouns);
      setProperNouns(detectedProperNouns);
    }
  }, [journalEntry]);

  return properNouns;
};

export default useProperNouns;
