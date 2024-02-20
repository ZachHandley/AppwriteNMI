import { Databases, ID } from "node-appwrite";

export const addLogToDB = async (
  db: Databases,
  db_id: string,
  coll_id: string,
  logObject: any,
  log: any,
  error: any
) => {
  try {
    const result = await db.createDocument(
      db_id,
      coll_id,
      ID.unique(),
      logObject
    );
    log("Log added to DB");
    return result;
  } catch (e) {
    error("Error adding log to DB");
    error(e);
  }
};
