import {v4 as uuidv4} from 'uuid';
import dayjs from 'dayjs';
import {realm} from './index';
import rootStore from '../mst';
import {DiaryEntryOut, DiaryEntryDBType} from '../types/DiaryEntry';
import {DataFromFile} from '../utils/GoogleDrive';
import {ChecklistEntryType} from '../types/ChecklistEntry';
// Read All
const readEntriesFromDB = (): DiaryEntryDBType[] => {
  const entries = realm.objects('Entry').sorted('date', true);
  return JSON.parse(JSON.stringify(entries));
};

// Store method to find entry by ID
const findEntryById = (id: string): DiaryEntryDBType | null => {
  const entry = realm.objectForPrimaryKey('Entry', id);
  console.log(`entry ${id}`, entry);
  return entry ? (JSON.parse(JSON.stringify(entry)) as DiaryEntryDBType) : null;
};

// Add
const addEntryToDB = async (item: DiaryEntryOut) => {
  const entries = realm.objects<DiaryEntryDBType>('Entry');
  const res = entries.filtered('date == $0', item.date);

  if (res.length) {
    return;
  }

  realm.write(() => {
    realm.create<DiaryEntryDBType>('Entry', {
      _id: item._id,
      date: item.date,
      desc: item.desc,
      createdAt: item.createdAt,
      modifiedAt: item.modifiedAt,
      mood: item.mood,
      latitude: item?.latitude,
      longitude: item?.longitude,
      weather: item?.weather,
      temperature: item?.temperature,
    });
  });
};

// Update
const updateEntryToDB = async (item: DiaryEntryDBType) => {
  const entries = realm.objects<DiaryEntryDBType>('Entry');
  const res = entries.filtered('date == $0', item.date);

  if (res.length) {
    realm.write(() => {
      res[0].desc = item.desc;
      res[0].mood = item.mood;
      res[0].modifiedAt = dayjs(new Date()).valueOf();
      res[0].deleted = false;
      res[0].latitude = item?.latitude;
      res[0].longitude = item?.longitude;
      res[0].weather = item?.weather;
      res[0].temperature = item?.temperature;
    });
  } else {
    realm.write(() => {
      realm.create<DiaryEntryDBType>('Entry', {
        ...item,
        _id: uuidv4(),
        createdAt: dayjs(new Date()).valueOf(),
        modifiedAt: dayjs(new Date()).valueOf(),
      });
    });
  }
};

// Delete item (Soft)
const softDeleteOneEntryFromDB = (item: DiaryEntryDBType) => {
  const res = realm.objectForPrimaryKey('Entry', item._id);
  if (res) {
    realm.write(() => {
      // @ts-ignore
      res.deleted = true;
      // @ts-ignore
      res.modifiedAt = dayjs(new Date()).valueOf();
    });
  }
};

// Delete item (Hard)
const deleteOneEntryFromDB = (item: DiaryEntryDBType) => {
  const resItem = realm.objectForPrimaryKey('Entry', item._id);
  realm.write(() => {
    realm.delete(resItem);
  });
};

// Delete All
const deleteAllEntriesFromDB = () => {
  realm.write(() => {
    // Delete all objects from the realm.
    realm.deleteAll();
  });
};

/**
 * Import from JSON source (Google Drive)
 * @param {*} data - Syncable data from Google Drive and Local combined
 * TODO: Delete functionality
 */
const importToDBFromJSON = (data: DataFromFile) => {
  let dataFromDB = realm
    .objects<DiaryEntryDBType>('Entry')
    .sorted('date', true);

  // Soft deleted
  // @ts-ignore
  let softDeleted = dataFromDB.filter(item => item.deleted === true);

  realm.write(() => {
    data.entries.forEach(obj => {
      // @ts-ignore
      let itemFoundInDB = dataFromDB.find(item => item._id === obj._id);
      if (!itemFoundInDB) {
        // If does not exist in DB, Create
        realm.create<DiaryEntryDBType>('Entry', obj);
      } else {
        // @ts-ignore
        if (itemFoundInDB.modifiedAt < obj.modifiedAt) {
          // If already exists && modified, Update

          // @ts-ignore
          itemFoundInDB.desc = obj.desc;
          // @ts-ignore
          itemFoundInDB.mood = obj.mood;
          // @ts-ignore
          itemFoundInDB.type = obj.type; // Update type field
          // @ts-ignore
          itemFoundInDB.modifiedAt = obj.modifiedAt;
          // @ts-ignore
          itemFoundInDB.deleted = obj.deleted;
          itemFoundInDB.latitude = obj.latitude;
          itemFoundInDB.longitude = obj.longitude;
          itemFoundInDB.weather = obj.weather;
          itemFoundInDB.temperature = obj.temperature;
        }
      }
    });

    // Hard delete the soft deleted
    softDeleted.forEach(obj => {
      // @ts-ignore
      realm.delete(obj);
    });
  });

  rootStore.populateStoreFromDB();
};

// Read All Checklist Entries
const readChecklistEntriesFromDB = (): ChecklistEntryType[] => {
  const entries = realm.objects('ChecklistEntry').sorted('createdAt', true);
  return JSON.parse(JSON.stringify(entries));
};

// Find Checklist Entry by ID
const findChecklistEntryById = (id: string): ChecklistEntryType | null => {
  const entry = realm.objectForPrimaryKey('ChecklistEntry', id);
  console.log(`checklist entry ${id}`, entry);
  return entry
    ? (JSON.parse(JSON.stringify(entry)) as ChecklistEntryType)
    : null;
};

// Add Checklist Entry
const addChecklistEntryToDB = async (
  item: Omit<ChecklistEntryType, '_id' | 'createdAt' | 'modifiedAt'>,
) => {
  realm.write(() => {
    realm.create<ChecklistEntryType>('ChecklistEntry', {
      _id: uuidv4(),
      desc: item.desc,
      type: item.type,
      isCompleted: false,
      createdAt: dayjs(new Date()).valueOf(),
      modifiedAt: dayjs(new Date()).valueOf(),
    });
  });
};

// Update Checklist Entry
const updateChecklistEntryToDB = async (item: ChecklistEntryType) => {
  const entry = realm.objectForPrimaryKey<ChecklistEntryType>(
    'ChecklistEntry',
    item._id,
  );

  if (entry) {
    realm.write(() => {
      entry.desc = item.desc;
      entry.type = item.type;
      entry.isCompleted = item.isCompleted;
      entry.modifiedAt = dayjs(new Date()).valueOf();
    });
  }
};

// Delete Checklist Entry
const deleteChecklistEntryFromDB = (id: string) => {
  const entry = realm.objectForPrimaryKey<ChecklistEntryType>(
    'ChecklistEntry',
    id,
  );

  if (entry) {
    realm.write(() => {
      realm.delete(entry);
    });
  }
};

export {
  readEntriesFromDB,
  findEntryById,
  addEntryToDB,
  updateEntryToDB,
  softDeleteOneEntryFromDB,
  deleteOneEntryFromDB,
  deleteAllEntriesFromDB,
  importToDBFromJSON,
  readChecklistEntriesFromDB,
  findChecklistEntryById,
  addChecklistEntryToDB,
  updateChecklistEntryToDB,
  deleteChecklistEntryFromDB,
};
