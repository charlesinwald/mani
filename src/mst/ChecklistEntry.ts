import {types, Instance, SnapshotIn, SnapshotOut} from 'mobx-state-tree';
import {v4 as uuidv4} from 'uuid';
import dayjs from 'dayjs';

const ChecklistEntryModel = types
  .model('ChecklistEntry', {
    _id: types.identifier,
    desc: types.string,
    type: types.enumeration('ChecklistEntryType', [
      'shortterm',
      'longterm',
      'Lifetime',
    ]),
    isCompleted: types.boolean,
    createdAt: types.number,
    modifiedAt: types.number,
  })
  .actions(self => ({
    setDescription(description: string) {
      self.desc = description;
      self.modifiedAt = dayjs().valueOf();
    },
    setType(type: 'Short Term' | 'Long Term' | 'Lifetime') {
      self.type = type;
      self.modifiedAt = dayjs().valueOf();
    },
    toggleCompleted() {
      self.isCompleted = !self.isCompleted;
      self.modifiedAt = dayjs().valueOf();
    },
  }))
  .views(self => ({
    get formattedCreatedAt() {
      return dayjs(self.createdAt).format('YYYY-MM-DD HH:mm:ss');
    },
    get formattedModifiedAt() {
      return dayjs(self.modifiedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  }));

export interface ChecklistEntry extends Instance<typeof ChecklistEntryModel> {}
export interface ChecklistEntrySnapshotIn
  extends SnapshotIn<typeof ChecklistEntryModel> {}
export interface ChecklistEntrySnapshotOut
  extends SnapshotOut<typeof ChecklistEntryModel> {}

export const createChecklistEntryModel = (
  snapshot?: ChecklistEntrySnapshotIn,
) => {
  const data: ChecklistEntrySnapshotIn = {
    _id: snapshot?._id ?? uuidv4(),
    desc: snapshot?.desc ?? '',
    type: snapshot?.type ?? 'shortterm',
    isCompleted: snapshot?.isCompleted ?? false,
    createdAt: snapshot?.createdAt ?? dayjs().valueOf(),
    modifiedAt: snapshot?.modifiedAt ?? dayjs().valueOf(),
  };
  return ChecklistEntryModel.create(data);
};

export default ChecklistEntryModel;