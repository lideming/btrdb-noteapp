import { getSession } from "@/utils/session";
import type { NextApiRequest, NextApiResponse } from "next"
import { addCollection, NoteCollection } from "@/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const now = Date.now();
  const col: NoteCollection = {
    id: null,
    owner: session.uid as string,
    name: 'new collection',
    ctime: now,
    mtime: now,
  };
  await addCollection(col);
  res.status(200).json(col);
}
