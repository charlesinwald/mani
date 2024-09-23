import Realm from 'realm';
import {Entry, User} from './models';

// Set up Realm configuration
const realmConfig = {
  schema: [Entry.schema, User.schema], // Your schemas
  schemaVersion: 2, // Increment the schema version
  migration: (
    oldRealm: {schemaVersion: number; objects: (arg0: string) => any},
    newRealm: {objects: (arg0: string) => any},
  ) => {
    // Get the old and new objects
    if (oldRealm.schemaVersion < 2) {
      const oldObjects = oldRealm.objects('Entry');
      const newObjects = newRealm.objects('Entry');

      // Iterate through all objects to add the default mood value
      for (let i = 0; i < oldObjects.length; i++) {
        newObjects[i].mood = ''; // Add default mood if it didn't exist before
      }
    }
  },
};

// Open Realm with the updated config
export const realm = new Realm(realmConfig);
