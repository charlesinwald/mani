import {types} from 'mobx-state-tree';

// Define the MemoirEntry model
const MemoirEntryModel = types.model('MemoirEntry', {
  _id: types.string, // Unique identifier for the entry
  date: types.string, // Date of the entry
  desc: types.string, // Description of the memoir
  createdAt: types.number, // Timestamp when the entry was created
  modifiedAt: types.number, // Timestamp when the entry was last modified
  mood: types.maybe(types.number), // Optional mood associated with the entry
  latitude: types.maybe(types.number), // Optional latitude for location
  longitude: types.maybe(types.number), // Optional longitude for location
  weather: types.maybe(types.string), // Optional weather description
  temperature: types.maybe(types.string), // Optional temperature
  deleted: types.maybe(types.boolean), // Optional flag for soft deletion
});

// Export the MemoirEntry model
export default MemoirEntryModel;
