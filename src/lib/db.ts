import Dexie, { type Table } from "dexie";
import type { Topic } from "@/types";

class DebateNotesDB extends Dexie {
  topics!: Table<Topic>;

  constructor() {
    super("DebateNotesDB");
    this.version(1).stores({
      topics: "id, title, parentId, *tags, createdAt, updatedAt, userId",
    });
  }
}

export const db = new DebateNotesDB();
