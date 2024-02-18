import { Client, Databases, ID, Query, Permission } from "node-appwrite";
import { initCollections } from "./methods/initCollections";
import { ZNMI } from "znmi";

const SHOULD_CHECK_DB = true;
const NMI_DB = "NMI";
const NMI_VAULT_COLLECTION = "NMIVault";
// REPLACE THIS WITH YOUR OWN SECURITY KEY WHEN NOT TESTING
// THIS IS NMI'S DEFAULT TESTING SECURITY KEY
// const NMI_SECURITY_KEY = Bun.env["NMI_SECURITY_KEY"];
const NMI_SECURITY_KEY = "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";

// This is your Appwrite function
// It's executed each time we get a request
export default async ({ req, res, log, error }: any) => {
  // Why not try the Appwrite SDK?
  const client = new Client()
    .setEndpoint("https://appwrite.blackleafdigital.com/v1")
    .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(Bun.env["APPWRITE_API_KEY"]);
  const db = new Databases(client);

  // First off, do we care about initializing anything?
  if (SHOULD_CHECK_DB) {
    // We're gonna need to check the database to see if we need to do anything
    await initCollections(db, NMI_DB, log, error);
  }
  log("Database initialized");
  return res.empty();
};
