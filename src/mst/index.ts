import React from 'react';
import {types, destroy, Instance} from 'mobx-state-tree';
import dayjs from 'dayjs';

import {
  DiaryEntryIn,
  DiaryEntryDBType,
  DiaryEntryOut,
} from '../types/DiaryEntry';

// Stores
import DiaryEntry from './DiaryEntry';
import User from './User';

// Realm DB Ops
import {
  readEntriesFromDB,
  addEntryToDB,
  updateEntryToDB,
  softDeleteOneEntryFromDB,
} from '../db/entry';

const RootStore = types
  .model({
    entries: types.array(DiaryEntry),
    user: User,
  })
  .views(self => ({
    getData() {
      return self.entries.sort(
        (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
      );
    },

    findEntryByDate(date: string) {
      return self.entries.filter(e => e.date === date);
    },
  }))
  .actions(self => ({
    populateStoreFromDB() {
      let itemsFromDB = readEntriesFromDB();
      let modifieddata = itemsFromDB
        .map((item: DiaryEntryDBType) => {
          const {
            deleted,
            _id,
            date,
            desc,
            mood,
            createdAt,
            modifiedAt,
            latitude,
            longitude,
            weather,
            temperature,
            type, // Include the type field
          } = item;
          return deleted
            ? null
            : {
                _id,
                date,
                desc,
                createdAt,
                modifiedAt,
                mood,
                latitude: latitude !== undefined ? latitude : 0, // Ensure latitude is not undefined
                longitude: longitude !== undefined ? longitude : 0, // Ensure longitude is not undefined
                weather,
                temperature,
                type, // Include the type field
              };
        })
        .filter(Boolean);
      // @ts-ignore
      self.entries = modifieddata;
    },

    addEntry(entry: DiaryEntryIn) {
      const entryOut: DiaryEntryOut = {
        ...entry,
        mood: entry.mood ?? 'Neutral', // Provide a default value for mood
        weather: entry.weather ?? 'Unknown', // Provide a default value for weather
        temperature: entry.temperature ?? 'Unknown', 
      };
      self.entries.unshift(entryOut);
      addEntryToDB(entryOut);
    },

    updateEntry(entry: DiaryEntryDBType) {
      let pos = self.entries.findIndex(e => e._id === entry._id);
      // if already exists, just replace existing object with the object received i.e 'entry'
      // else, insert the entry object in it's place according to date
      if (pos >= 0) {
        self.entries.splice(pos, 1, entry);
      } else {
        let isInserted = false;
        for (let i = 0; i < self.entries.length; i++) {
          if (dayjs(entry.date).isAfter(self.entries[i].date)) {
            self.entries.splice(i, 0, entry);
            isInserted = true;
            break;
          }
        }

        if (!isInserted) {
          self.entries.push(entry);
        }
      }
      updateEntryToDB(entry);
    },

    deleteEntry(entry: DiaryEntryDBType) {
      const entryToDelete = self.entries.find(e => e._id === entry._id);
      if (entryToDelete) {
        // Ensure the 'deleted' property is set before passing to the function
        const entryWithDeleted = {...entryToDelete, deleted: true};
        softDeleteOneEntryFromDB(entryWithDeleted);
        destroy(entryToDelete);
      }
    },
  }));

const rootStore = RootStore.create({
  entries: [
    // {
    //   _id: 'b91289ce-c2fe-43ed-9830-f5cb5f222a7b',
    //   date: '2021-11-16',
    //   desc: 'lorem ipsum',
    //   createdAt: 1637330913,
    //   modifiedAt: 1637330913,
    // },
  ],
  user: {
    _id: '',
    name: '',
    email: '',
    photo: '',
    isSecure: true,
    isUnlocked: false,
    lastSynced: 0,
    isAutoSync: false,
  },
});

export default rootStore;
export interface RootStoreType extends Instance<typeof RootStore> {}

export const MSTContext = React.createContext<RootStoreType>(rootStore);
