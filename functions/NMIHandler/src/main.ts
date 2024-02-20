import { Client, Databases, ID, Query, Permission } from "node-appwrite";
import { initCollections } from "./methods/initCollections";
import { ZNMI } from "znmi";
import { requestInfo } from "./types";
import { addLogToDB } from "./methods/logsHandler";
import { z } from "zod";

type RequestInfo = z.infer<typeof requestInfo>;

const SHOULD_CHECK_DB = true;
const NMI_DB = "NMI";
// REPLACE THIS WITH YOUR OWN SECURITY KEY WHEN NOT TESTING
// THIS IS NMI'S DEFAULT TESTING SECURITY KEY
// const NMI_SECURITY_KEY = Bun.env["NMI_SECURITY_KEY"];
const NMI_SECURITY_KEY = "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";

const createNmi = async (security_key: string) => {
  return new ZNMI(security_key);
};

/**
 * Creates a log in the database in the specified collection and, additionally, in the Gateway Logs collection
 * @param db The database object
 * @param db_id The ID of the database
 * @param coll_id The ID of the collection
 * @param all_coll_id The ID of the Gateway Logs collection
 * @param logData The data to log
 * @param initiatedBy The user who initiated the log
 * @param log The log function
 * @param error The error function
 */
const createLog = async (
  db: Databases,
  db_id: string,
  coll_id: string,
  all_coll_id: string,
  logData: any,
  initiatedBy: string,
  log: any,
  error: any
) => {
  try {
    log("Adding logs to DB");
    logData.initiatedBy = initiatedBy;
    await addLogToDB(db, db_id, coll_id, logData, log, error);
    await addLogToDB(db, db_id, all_coll_id, logData, log, error);
  } catch (e) {
    error("Error adding logs to DB");
    error(e);
  }
};

// This is your Appwrite function
// It's executed each time we get a request
export default async ({ req, res, log, error }: any) => {
  // Why not try the Appwrite SDK?
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    // @ts-ignore
    .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
    // @ts-ignore
    .setKey(Bun.env["APPWRITE_API_KEY"]);
  const db = new Databases(client);
  const nmi = await createNmi(NMI_SECURITY_KEY);
  const allDbCollInfo = await initCollections(db, NMI_DB, log, error);
  log("Database initialized");
  let requestData: RequestInfo;
  if (typeof req.body !== "object") {
    requestData = requestInfo.parse(JSON.parse(req.body));
  } else {
    requestData = requestInfo.parse(req.body);
  }
  log("Request data parsed");
  let response: any;
  switch (requestData.requestCategory) {
    case "transaction":
      switch (requestData.requestAction) {
        case "create":
          response = await nmi.transactions.createTransaction(requestData.data);
          await createLog(
            db,
            allDbCollInfo.database,
            allDbCollInfo.collections.transactions,
            allDbCollInfo.collections.allLogs,
            requestData.data,
            requestData.initiatedBy,
            log,
            error
          );
          return res.json(response);
        case "update":
          response = await nmi.transactions.updateTransaction(requestData.data);
          await createLog(
            db,
            allDbCollInfo.database,
            allDbCollInfo.collections.transactions,
            allDbCollInfo.collections.allLogs,
            requestData.data,
            requestData.initiatedBy,
            log,
            error
          );
          return res.json(response);
        case "validate":
          response = await nmi.transactions.validateTransaction(
            requestData.data
          );
          await createLog(
            db,
            allDbCollInfo.database,
            allDbCollInfo.collections.transactions,
            allDbCollInfo.collections.allLogs,
            requestData.data,
            requestData.initiatedBy,
            log,
            error
          );
          return res.json(response);
        case "authorize":
          response = await nmi.transactions.authorizeTransaction(
            requestData.data
          );
          return res.json(response);
        case "capture":
          response = await nmi.transactions.captureTransaction(
            requestData.data
          );
          return res.json(response);
        case "refund":
          response = await nmi.transactions.refundTransaction(requestData.data);
          return res.json(response);
        case "void":
          response = await nmi.transactions.voidTransaction(requestData.data);
          return res.json(response);
        default:
          return res.json({
            status: 500,
            message: "Invalid request action for transaction category",
          });
      }
    case "subscription":
      switch (requestData.requestAction) {
        case "addPlan":
          response = await nmi.recurring.addRecurringPlan(requestData.data);
          return res.json(response);
        case "editPlan":
          response = await nmi.recurring.editRecurringPlan(requestData.data);
          return res.json(response);
        case "addCustomByAch":
          response = await nmi.recurring.addCustomSubscriptionByAch(
            requestData.data
          );
          return res.json(response);
        case "addCustomByCreditCard":
          response = await nmi.recurring.addCustomSubscriptionByCc(
            requestData.data
          );
          return res.json(response);
        case "updateSubscription":
          response = await nmi.recurring.updateSubscription(requestData.data);
          return res.json(response);
        case "deleteSubscription":
          response = await nmi.recurring.deleteSubscription(requestData.data);
          return res.json(response);
        default:
          return res.json({
            status: 500,
            message: "Invalid request action for subscription category",
          });
      }
    case "customerVault":
      switch (requestData.requestAction) {
        case "addCustomer":
          response = await nmi.customerVault.addCustomer(requestData.data);
          return res.json(response);
        case "updateCustomer":
          response = await nmi.customerVault.updateCustomer(requestData.data);
          return res.json(response);
        case "initiateTransaction":
          response = await nmi.customerVault.initiateCustomerVaultTransaction(
            requestData.data
          );
          return res.json(response);
        case "validateCustomer":
          response = await nmi.customerVault.validateCustomerByVaultId(
            requestData.data
          );
          return res.json(response);
        case "authorizeCustomer":
          response = await nmi.customerVault.authorizeCustomerByVaultId(
            requestData.data
          );
          return res.json(response);
        case "creditTransaction":
          response = await nmi.customerVault.creditTransactionByVaultId(
            requestData.data
          );
          return res.json(response);
        case "offlineTransaction":
          response = await nmi.customerVault.offlineTransactionByVaultId(
            requestData.data
          );
          return res.json(response);
        case "addBilling":
          response = await nmi.customerVault.addBillingToCustomer(
            requestData.data
          );
          return res.json(response);
        case "updateBilling":
          response = await nmi.customerVault.updateBillingForCustomer(
            requestData.data
          );
          return res.json(response);
        case "deleteBilling":
          response = await nmi.customerVault.deleteBillingForCustomer(
            requestData.data
          );
          return res.json(response);
        case "deleteCustomer":
          response = await nmi.customerVault.deleteCustomerRecord(
            requestData.data
          );
          return res.json(response);
        default:
          return res.json({
            status: 500,
            message: "Invalid request action for customerVault category",
          });
      }
    case "productManager":
      switch (requestData.requestAction) {
        case "addProduct":
          response = await nmi.products.addProduct(requestData.data);
          return res.json(response);
        case "updateProduct":
          response = await nmi.products.updateProduct(requestData.data);
          return res.json(response);
        case "deleteProduct":
          response = await nmi.products.deleteProduct(requestData.data);
          return res.json(response);
        default:
          return res.json({
            status: 500,
            message: "Invalid request action for productManager category",
          });
      }
      break;
    case "invoice":
      switch (requestData.requestAction) {
        case "create":
          response = await nmi.invoices.createInvoice(requestData.data);
          return res.json(response);
        case "update":
          response = await nmi.invoices.updateInvoice(requestData.data);
          return res.json(response);
        case "close":
          response = await nmi.invoices.closeInvoice(requestData.data);
          return res.json(response);
        case "send":
          response = await nmi.invoices.sendInvoice(requestData.data);
          return res.json(response);
        default:
          return res.json({
            status: 500,
            message: "Invalid request action for invoice category",
          });
      }
    default:
      return res.json({
        status: 500,
        message: "Invalid request category",
      });
  }

  return res.empty();
};
