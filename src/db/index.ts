import Realm from 'realm';
import {ChecklistEntry, Entry, User, MemoirEntry, ChecklistLog} from './models';
import RNFS from 'react-native-fs';

// Set up Realm configuration
const realmConfig = {
  schema: [
    Entry.schema,
    User.schema,
    ChecklistEntry.schema,
    ChecklistLog.schema,
    MemoirEntry.schema,
  ], // Your schemas
  schemaVersion: 4, // Increment the schema version
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
        newObjects[i].latitude =
          oldObjects[i].latitude !== undefined ? oldObjects[i].latitude : 0;
        newObjects[i].longitude =
          oldObjects[i].longitude !== undefined ? oldObjects[i].longitude : 0;
        newObjects[i].weather =
          oldObjects[i].weather !== undefined ? oldObjects[i].weather : '';
        newObjects[i].temperature =
          oldObjects[i].temperature !== undefined
            ? oldObjects[i].temperature
            : '';
      }
    }
  },
};
const wipeRealmDB = async () => {
  try {
    // Close the Realm instance before deleting the file
    if (realm) {
      realm.close();
    }
    const realmPath = Realm.defaultPath;

    // Check if the Realm file exists
    if (await RNFS.exists(realmPath)) {
      await RNFS.unlink(realmPath); // Delete the Realm file
      console.log('Realm database wiped');
    } else {
      console.log('Realm database not found, no need to wipe');
    }
  } catch (error) {
    console.error('Error wiping Realm database:', error);
  }
};
// wipeRealmDB();
// Open Realm with the updated config
export const realm = new Realm(realmConfig);
// console.log('Realm path:', realm.path);
