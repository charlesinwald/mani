import {useState, useEffect} from 'react';
import nlp from 'compromise';

const useProperNouns = (journalEntry: string) => {
  const [properNouns, setProperNouns] = useState<
    Array<{text: string; type: string}>
  >([]);

  useEffect(() => {
    if (journalEntry) {
      const doc = nlp(journalEntry);

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
    }
  }, [journalEntry]);

  return properNouns;
};

export default useProperNouns;
