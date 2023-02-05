import { Note, NoteCollection, UserInfo } from "./models";
import { Database, IDbDocSet, nanoIdGenerator } from "@yuuza/btrdb";
import { mkdir } from "fs/promises";
import { addCollection, getNotesByOwner, updateNote } from "./notes";

// Somehow Next.js inlined this file multiple times, ensure there is only one instance here.
export const { db, initDb } = globalThis._mydb as null ||
  (globalThis._mydb = createDatabase());

function createDatabase() {
  const db = new Database();
  const initDb = async function () {
    console.info("Initialing DB...");
    await mkdir("./data/", { recursive: true });
    await db.openFile("./data/db.btrdb");

    const notes = await db.createSet<Note>("notes", "doc");
    notes.idGenerator = nanoIdGenerator(10);
    await notes.useIndexes({
      owner: (x) => x.owner,
      col: (x) => x.col,
    });

    const users = await db.createSet<UserInfo>("users", "doc");
    await users.useIndexes({
      email: (x) => x.email,
    });

    const cols = await db.createSet<NoteCollection>("notecols", "doc");
    cols.idGenerator = nanoIdGenerator(10);
    await cols.useIndexes({
      owner: (x) => x.owner,
    });

    await migrate({ notes, users, cols });

    await db.commit();
    // console.info("Rebuilding DB...");
    // await db.rebuild();
    console.info("Finished initialing DB.");

    return { notes, users, cols };
  };
  return { db, initDb: initDb() };
}

export async function getNotesSet() {
  return (await initDb).notes;
}

export async function getNoteCollectionsSet() {
  return (await initDb).cols;
}

export async function getUsersSet() {
  return (await initDb).users;
}

async function migrate(sets: {
  users: IDbDocSet<UserInfo>;
  notes: IDbDocSet<Note>;
  cols: IDbDocSet<NoteCollection>;
}) {
  const { users, notes, cols } = sets;
  const config = await db.createSet("config", "kv");
  const origVer = await config.get("version");
  let ver = origVer;
  console.info("DB version", ver);
  if (ver == null) {
    ver = 1;
  }
  if (ver == 1) {
    ver = 2;
    // convert number id to nanoid
    const now = Date.now();
    for (const note of await notes.getAll()) {
      if (typeof note.id == "number") {
        await notes.delete(note.id);
        note.id = null;
        note.mtime = note.ctime = now;
        await notes.insert(note);
      }
    }
  }
  if (ver == 2) {
    ver = 3;
    // make a default collection for each user
    const now = Date.now();
    for (const uid of await users.getIds()) {
      const col: NoteCollection = {
        id: null,
        name: "default",
        owner: uid,
        ctime: now,
        mtime: now,
      };
      await cols.insert(col);
      for (const note of await notes.findIndex("owner", uid)) {
        note.col = col.id;
        await notes.update(note);
      }
    }
  }
  if (ver !== origVer) {
    console.info("DB version changed", ver);
    await config.set("version", ver);
  }
}
