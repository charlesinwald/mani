// Define the MemoirEntryType
// type MemoirEntryType = {
//   _id: string; // Unique identifier for the entry
//   date: string; // Date of the entry
//   desc: string; // Description of the memoir
//   createdAt: number; // Timestamp when the entry was created
//   modifiedAt: number; // Timestamp when the entry was last modified
//   mood?: number; // Optional mood associated with the entry
//   latitude?: number; // Optional latitude for location
//   longitude?: number; // Optional longitude for location
//   weather?: string; // Optional weather description
//   temperature?: string; // Optional temperature
//   deleted?: boolean; // Optional flag for soft deletion
// };

import {SnapshotIn, SnapshotOut} from 'mobx-state-tree';
import MemoirEntryModel from '../mst/MemoirEntry';

interface MemoirEntryIn extends SnapshotIn<typeof MemoirEntryModel> {
  date: string;
  desc: string;
}
interface MemoirEntryOut extends SnapshotOut<typeof MemoirEntryModel> {}

interface MemoirEntryDBType extends MemoirEntryIn {
  deleted: boolean;
}

export type {MemoirEntryIn, MemoirEntryOut, MemoirEntryDBType};
