import { getSession } from "@/utils/session";
import type { NextApiRequest, NextApiResponse } from "next"
import { deleteNote, getCollectionById, getNoteById, updateNote } from "@/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;
  const colid = req.query.colid as string;
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).end();
    return;
  }
  const note = await getNoteById(id);
  if (!note || note.owner !== session.uid || note.col !== colid) {
    res.status(404).end();
    return
  }
  const now = Date.now();
  if (req.method == "PUT") {
    note.mtime = now;
    note.text = req.body.text;
    const col = await getCollectionById(colid);
    col.mtime = now;
    await updateNote(note, col);
    res.status(200).end();
  } else if (req.method == "DELETE") {
    const col = await getCollectionById(colid);
    col.mtime = now;
    await deleteNote(note, col);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
}
