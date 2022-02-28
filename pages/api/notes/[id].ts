import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { deleteNote, getNoteById, updateNote } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).end();
    return;
  }
  const note = await getNoteById(id);
  if (!note || note.owner !== session.uid) {
    res.status(404).end();
    return
  }
  if (req.method == "PUT") {
    note.mtime = Date.now();
    note.text = req.body.text;
    await updateNote(note);
    res.status(200).end();
  } else if (req.method == "DELETE") {
    await deleteNote(note);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
}
