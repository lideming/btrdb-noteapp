import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { addNote, getCollectionById, Note } from "../../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const colid = req.query.colid as string;
  const col = await getCollectionById(colid);
  if (!col || col.owner !== session.uid) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  const now = Date.now();
  const note: Note = {
    id: null,
    owner: session.uid as string,
    col: colid,
    text: '',
    type: 'text',
    ctime: now,
    mtime: now,
  };
  await addNote(note);
  res.status(200).json(note);
}
