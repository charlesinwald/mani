type ChecklistEntryType = {
  _id: string;
  desc: string;
  type: 'shortterm' | 'longterm' | 'lifetime';
  isCompleted: boolean;
  createdAt: number;
  modifiedAt: number;
};
export type {ChecklistEntryType};
