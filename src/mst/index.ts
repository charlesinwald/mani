import React from 'react';
import {types, destroy, Instance, cast} from 'mobx-state-tree';
import dayjs from 'dayjs';

import {
  DiaryEntryIn,
  DiaryEntryDBType,
  DiaryEntryOut,
} from '../types/DiaryEntry';
import {ChecklistEntryType} from '../types/ChecklistEntry';
// Stores
import DiaryEntry from './DiaryEntry';
import User from './User';
import ChecklistEntryModel from './ChecklistEntry';
import {v4 as uuidv4} from 'uuid';

// Realm DB Ops
import {
  readEntriesFromDB,
  addEntryToDB,
  updateEntryToDB,
  softDeleteOneEntryFromDB,
  readChecklistEntriesFromDB,
  addChecklistEntryToDB,
  updateChecklistEntryToDB,
  deleteChecklistEntryFromDB,
} from '../db/entry';

const RootStore = types
  .model({
    entries: types.array(DiaryEntry),
    checklistEntries: types.array(ChecklistEntryModel),
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

    getChecklistEntries() {
      return self.checklistEntries;
    },

    getChecklistEntriesByType(type: 'Short Term' | 'Long Term' | 'Lifetime') {
      return self.checklistEntries.filter(entry => entry.type === type);
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
                latitude: latitude !== undefined ? latitude : 0,
                longitude: longitude !== undefined ? longitude : 0,
                weather,
                temperature,
              };
        })
        .filter(Boolean);
      // @ts-ignore
      self.entries = modifieddata;

      // Populate checklist entries
      let checklistItemsFromDB = readChecklistEntriesFromDB().filter(
        item => item !== undefined,
      );
      self.checklistEntries = checklistItemsFromDB;
    },

    addEntry(entry: DiaryEntryIn) {
      const entryOut: DiaryEntryOut = {
        ...entry,
        mood: entry.mood ?? 'Neutral',
        weather: entry.weather ?? 'Unknown',
        temperature: entry.temperature ?? 'Unknown',
      };
      self.entries.unshift(entryOut);
      addEntryToDB(entryOut);
    },

    updateEntry(entry: DiaryEntryDBType) {
      let pos = self.entries.findIndex(e => e._id === entry._id);
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
        const entryWithDeleted = {...entryToDelete, deleted: true};
        softDeleteOneEntryFromDB(entryWithDeleted);
        destroy(entryToDelete);
      }
    },

    // Checklist Entry actions
    addChecklistEntry(
      entry: Omit<ChecklistEntryType, '_id' | 'createdAt' | 'modifiedAt'>,
    ) {
      const newEntry = ChecklistEntryModel.create({
        _id: uuidv4(),
        ...entry,
        desc: entry.desc || '', // Provide default empty string if title is undefined
        createdAt: dayjs().valueOf(),
        modifiedAt: dayjs().valueOf(),
        type: entry.type || 'shortterm', // Provide default value if type is undefined
        thinkAboutIt: false,
        talkAboutIt: false,
        actOnIt: false,
      });
      console.log('newEntry', newEntry);
      self.checklistEntries.push(newEntry);
      addChecklistEntryToDB(newEntry as ChecklistEntryType);
    },

    updateChecklistEntry(entry: ChecklistEntryType) {
      const index = self.checklistEntries.findIndex(e => e._id === entry._id);
      if (index !== -1) {
        self.checklistEntries[index] = ChecklistEntryModel.create(entry);
        updateChecklistEntryToDB(entry);
      }
    },

    deleteChecklistEntry(id: string) {
      const entryToDelete = self.checklistEntries.find(e => e._id === id);
      if (entryToDelete) {
        destroy(entryToDelete);
        deleteChecklistEntryFromDB(id);
      }
    },

    toggleThinkAboutIt(id: string) {
      const entry = self.checklistEntries.find(e => e._id === id);
      if (entry) {
        entry.thinkAboutIt = !entry.thinkAboutIt; // Toggle the property
        entry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
      }
    },
    toggleTalkAboutIt(id: string) {
      const entry = self.checklistEntries.find(e => e._id === id);
      if (entry) {
        entry.talkAboutIt = !entry.talkAboutIt; // Toggle the property
        entry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
      }
    },
    toggleActOnIt(id: string) {
      const entry = self.checklistEntries.find(e => e._id === id);
      if (entry) {
        entry.actOnIt = !entry.actOnIt; // Toggle the property
        entry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
      }
    },
  }));

const rootStore = RootStore.create({
  entries: [],
  checklistEntries: [],
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
