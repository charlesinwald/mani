type ChecklistEntryType = {
  _id: string;
  desc: string;
  type: 'shortterm' | 'longterm' | 'lifetime';
  thinkAboutIt: boolean;
  talkAboutIt: boolean;
  actOnIt: boolean;
  createdAt: number;
  modifiedAt: number;
  completed: boolean;
};
export type {ChecklistEntryType};
