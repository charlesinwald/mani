import Realm from 'realm';

class Entry extends Realm.Object {
  _id!: string;
  date: string = '';
  desc: string | undefined = ''; // Updated to allow undefined
  createdAt: number | undefined;
  modifiedAt: number | undefined;
  deleted: boolean = false;
  mood: number = 1; // Changed from string to number with default value of 1
  latitude: number = 0;
  longitude: number = 0;
  weather: string = '';
  temperature: string = '';

  static schema: Realm.ObjectSchema = {
    name: 'Entry',
    properties: {
      // _id: uuid4()
      _id: 'string',
      // date: 2021-11-15
      date: 'string',
      // desc: Random strings
      desc: 'string?', // Updated to allow undefined
      // createdAt: UNIX timestamp
      createdAt: 'int',
      // modifiedAt: UNIX timestamp
      modifiedAt: 'int',
      // deleted: Boolean
      deleted: {type: 'bool', default: false},
      mood: {type: 'int', default: 1}, // Updated to be an integer with a default value of 1
      latitude: 'double?',
      longitude: 'double?',
      weather: 'string',
      temperature: 'string',
    },
    primaryKey: '_id',
  };
}

class User extends Realm.Object {
  _id!: string;
  name: string = '';
  email: string = '';
  photo: string = '';
  lastSynced: number = 0;
  isAutoSync: boolean = false;

  static schema: Realm.ObjectSchema = {
    name: 'User',
    properties: {
      _id: 'string',
      name: 'string',
      email: 'string',
      photo: 'string',
      lastSynced: {type: 'int', default: 0},
      isAutoSync: {type: 'bool', default: false},
    },
    primaryKey: '_id',
  };
}

class ChecklistEntry extends Realm.Object {
  _id!: string;
  title: string = '';
  isCompleted: boolean = false;
  createdAt: number | undefined;
  modifiedAt: number | undefined;
  deleted: boolean = false;

  static schema: Realm.ObjectSchema = {
    name: 'ChecklistEntry',
    properties: {
      _id: 'string',
      title: 'string',
      isCompleted: {type: 'bool', default: false},
      createdAt: 'int',
      modifiedAt: 'int',
      deleted: {type: 'bool', default: false},
    },
    primaryKey: '_id',
  };
}

export {Entry, User, ChecklistEntry};
