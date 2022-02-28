import { Note, UserInfo } from "./models";
import { Database, nanoIdGenerator } from "@yuuza/btrdb";
import { mkdir } from "fs/promises";

// Somehow Next.js inlined this file multiple times, ensure there is only one instance here.
export const { db, initDb } = (globalThis._mydb as null || (globalThis._mydb = {
    db: new Database(),
    initDb: (async function () {
        console.info("Initialing DB...");
        await mkdir("./data/", { recursive: true });
        await db.openFile("./data/db.btrdb")

        const notes = await db.createSet<Note>("notes", "doc");
        await notes.useIndexes({
            owner: x => x.owner,
        });

        const users = await db.createSet<UserInfo>("users", "doc");
        await users.useIndexes({
            email: x => x.email,
        });

        await migrate();

        await db.commit();
        // console.info("Rebuilding DB...");
        // await db.rebuild();
        console.info("Finished initialing DB.");
    })(),
}));

export async function getNotesSet() {
    await initDb;
    const set = await db.getSet<Note>("notes", "doc");
    set.idGenerator = nanoIdGenerator(10);
    return set;
}

export async function getUsersSet() {
    await initDb;
    return await db.getSet<UserInfo>("users", "doc");
}

async function migrate() {
    const config = await db.createSet("config", "kv");
    const origVer = await config.get("version");
    let ver = origVer;
    console.info("DB version", ver);
    if (ver == null) {
        ver = 1;
    }
    if (ver == 1) {
        ver = 2;
        const notes = await db.getSet<Note>("notes", "doc");
        notes.idGenerator = nanoIdGenerator(10);
        for (const note of await notes.getAll()) {
            console.info(note);
            if (typeof note.id == "number") {
                await notes.delete(note.id);
                note.id = null;
                note.mtime = note.ctime = Date.now();
                await notes.insert(note);
            }
        }
    }
    if (ver !== origVer) {
        console.info("DB version changed", ver);
        await config.set("version", ver);
    }
}