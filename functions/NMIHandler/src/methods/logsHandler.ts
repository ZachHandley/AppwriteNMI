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
    // Add timestamp and metadata to log
    const logWithMetadata = {
      ...logObject,
      timestamp: new Date().toISOString(),
      type: logObject.requestCategory || "unknown",
      status: logObject.response?.status || "unknown",
      error: logObject.response?.error || null
    };
    
    const result = await db.createDocument(
      db_id,
      coll_id,
      ID.unique(),
      logWithMetadata
    );
    log("Log added to DB");
    return result;
  } catch (e) {
    error("Error adding log to DB");
    error(e);
  }
};

export const createLog = async (
  db: Databases,
  db_id: string,
  specific_coll_id: string,
  all_logs_coll_id: string,
  logObject: any,
  initiatedBy: string,
  log: any,
  error: any
) => {
  try {
    // Add to specific collection (e.g., queries)
    await addLogToDB(db, db_id, specific_coll_id, logObject, log, error);
    
    // Add to all logs collection
    await addLogToDB(db, db_id, all_logs_coll_id, {
      ...logObject,
      initiatedBy,
      collectionSource: specific_coll_id
    }, log, error);
  } catch (e) {
    error("Error in createLog");
    error(e);
    throw e;
  }
};