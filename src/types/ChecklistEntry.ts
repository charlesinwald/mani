export interface ChecklistLogType {
  _id: string;
  checklistId: string;
  type: 'think' | 'talk' | 'act';
  note: string;
  timestamp: string;
}

export interface ChecklistEntryType {
  _id: string;
  desc: string;
  type: string;
  completed: boolean;
  thinkAboutIt: boolean;
  talkAboutIt: boolean;
  actOnIt: boolean;
  createdAt: number;
  progress_logs?: ChecklistLogType[];
}
