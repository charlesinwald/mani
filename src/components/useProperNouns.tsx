import {useState, useEffect, useCallback} from 'react';
import nlp from 'compromise';
import debounce from 'lodash/debounce';

const useProperNouns = (journalEntry: string) => {
  const [properNouns, setProperNouns] = useState<
    Array<{text: string; type: string}>
  >([]);

  const detectProperNouns = useCallback(
    debounce((text: string) => {
      if (text) {
        const doc = nlp(text);

        // Extract people's names
        const people = doc.people().out('array');

        // Extract place names
        const places = doc.places().out('array');

        // Extract organizations
        const organizations = doc.organizations().out('array');

        // Combine all proper nouns
        const allProperNouns = [
          ...people.map(name => ({text: name, type: 'PERSON'})),
          ...places.map(place => ({text: place, type: 'PLACE'})),
          ...organizations.map(org => ({text: org, type: 'ORGANIZATION'})),
        ];

        // Remove duplicates
        const uniqueProperNouns = Array.from(
          new Set(allProperNouns.map(item => JSON.stringify(item))),
        ).map(item => JSON.parse(item));

        setProperNouns(uniqueProperNouns);
      } else {
        setProperNouns([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    detectProperNouns(journalEntry);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      detectProperNouns.cancel();
    };
  }, [journalEntry, detectProperNouns]);

  return properNouns;
};

export default useProperNouns;
