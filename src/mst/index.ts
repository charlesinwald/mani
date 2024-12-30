import React from 'react';
import {types, destroy, Instance, cast} from 'mobx-state-tree';
import dayjs from 'dayjs';

import {
  DiaryEntryIn,
  DiaryEntryDBType,
  DiaryEntryOut,
} from '../types/DiaryEntry';
import {MemoirEntryIn, MemoirEntryOut} from '../types/MemoirEntry';
import {ChecklistEntryType, ChecklistLogType} from '../types/ChecklistEntry';
import MemoirEntryModel from './MemoirEntry';
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
  readMemoirEntriesFromDB,
  addMemoirEntryToDB,
  updateMemoirEntryToDB,
  deleteOneMemoirEntryFromDB,
} from '../db/entry';
import {MemoirEntryType} from '../types/MemoirEntry';

const RootStore = types
  .model({
    entries: types.array(DiaryEntry),
    checklistEntries: types.array(ChecklistEntryModel),
    memoirEntries: types.array(MemoirEntryModel),
    user: User,
  })
  .views(self => ({
    getData() {
      return self.entries.sort(
        (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf(),
      );
    },

    getMemoirEntries() {
      return self.memoirEntries.sort(
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

      // Populate memoir entries
      let memoirItemsFromDB = readMemoirEntriesFromDB().filter(
        item => item !== undefined,
      );
      self.memoirEntries = memoirItemsFromDB;
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

    // Memoir Entry actions
    addMemoirEntry(entry: MemoirEntryIn) {
      console.log('addMemoirEntry', entry);
      const newEntry = MemoirEntryModel.create({
        ...entry,
        desc: (entry as {desc?: string}).desc || '', // Ensure desc is provided with a default value
      });
      self.memoirEntries.push(newEntry);
      addMemoirEntryToDB(newEntry);
    },

    updateMemoirEntry(entry: MemoirEntryType) {
      const index = self.memoirEntries.findIndex(e => e._id === entry._id);
      if (index !== -1) {
        self.memoirEntries[index] = MemoirEntryModel.create(entry);
        console.log('updateMemoirEntry', entry);
        updateMemoirEntryToDB(entry);
      }
    },

    deleteMemoirEntry(id: string) {
      const entryToDelete = self.memoirEntries.find(e => e._id === id);
      if (entryToDelete) {
        destroy(entryToDelete);
        deleteOneMemoirEntryFromDB(id);
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

    addChecklistLog(log: ChecklistLogType) {
      console.log('addChecklistLog', log);
      const checklistEntry: ChecklistEntryType | undefined =
        self.checklistEntries.find(e => e._id === log.checklistId);

      if (checklistEntry && checklistEntry.progress_logs) {
        // Ensure the log is structured correctly
        checklistEntry.progress_logs.push({
          _id: log._id, // Ensure this is unique
          timestamp: log.timestamp,
          note: log.note,
          type: log.type,
          checklistId: log.checklistId,
        });
        console.log('checklistEntry mst', JSON.stringify(checklistEntry));

        // Update the checklist entry in the database
        updateChecklistEntryToDB(checklistEntry);
      } else {
        console.error(`Checklist entry with ID ${log.checklistId} not found.`);
      }
    },

    updateChecklistLog(log: ChecklistLogType) {
      const index = self.checklistEntries.findIndex(
        e => e._id === log.checklistId,
      );
      if (index !== -1) {
        self.checklistEntries[index].progress_logs.push(log);
        updateChecklistEntryToDB(self.checklistEntries[index]);
      }
    },

    deleteChecklistLog(id: string) {
      const index = self.checklistEntries.findIndex(e => e._id === id);
      if (index !== -1) {
        self.checklistEntries[index].progress_logs = self.checklistEntries[
          index
        ].progress_logs.filter(log => log._id !== id);
        updateChecklistEntryToDB(self.checklistEntries[index]);
      }
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
        const newEntry = entry;
        newEntry.thinkAboutIt = !entry.thinkAboutIt; // Toggle the property
        newEntry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
        updateChecklistEntryToDB(newEntry);
      }
    },
    toggleTalkAboutIt(id: string) {
      const entry = self.checklistEntries.find(e => e._id === id);
      if (entry) {
        const newEntry = entry;
        newEntry.talkAboutIt = !entry.talkAboutIt; // Toggle the property
        newEntry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
        updateChecklistEntryToDB(newEntry);
      }
    },
    toggleActOnIt(id: string) {
      const entry = self.checklistEntries.find(e => e._id === id);
      if (entry) {
        const newEntry = entry;
        newEntry.actOnIt = !entry.actOnIt; // Toggle the property
        newEntry.modifiedAt = dayjs().valueOf(); // Update modifiedAt
        updateChecklistEntryToDB(newEntry);
      }
    },
  }));

const rootStore = RootStore.create({
  entries: [],
  checklistEntries: [],
  memoirEntries: [],
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
export interface RootStoreType extends Instance<typeof RootStore> {
  memoirEntries: any;
}

export const MSTContext = React.createContext<RootStoreType>(rootStore);
