import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { addNote, Note } from "../../../db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const note: Note = {
    id: null,
    owner: session.uid as string,
    text: '',
    type: 'text',
  };
  await addNote(note);
  res.status(200).json(note);
}
