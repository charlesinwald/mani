import {types} from 'mobx-state-tree';

const DiaryEntry = types.model('DiaryEntry', {
  // _id: uuid4()
  _id: types.string,
  // date: 2021-11-15
  date: types.string,
  // desc: Random strings
  desc: types.string,
  // createdAt: UNIX timestamp
  createdAt: types.number,
  // modifiedAt: UNIX timestamp
  type: types.string,
  modifiedAt: types.number,
  mood: types.optional(types.string, ''),
  latitude: types.number,
  longitude: types.number,
  weather: types.optional(types.string, ''),
  temperature: types.optional(types.string, ''),
});

export default DiaryEntry;
