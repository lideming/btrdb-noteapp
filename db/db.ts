import { Note, UserInfo } from "./models";
import { Database } from "@yuuza/btrdb";
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

        console.info("Rebuilding DB...");
        await db.rebuild();
        console.info("Finished initialing DB.");
    })(),
}));

export async function getNotesSet() {
    await initDb;
    return await db.getSet<Note>("notes", "doc");
}

export async function getUsersSet() {
    await initDb;
    return await db.getSet<UserInfo>("users", "doc");
}
