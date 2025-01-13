import { Client, Databases, ID, Query, Permission } from "node-appwrite";
import { initCollections } from "./methods/initCollections";
import { ZNMI } from "znmi";
import { requestInfo, RequestCategory, RequestInfo } from "./types";
import { createLog } from "./methods/logsHandler";

const SHOULD_CHECK_DB = true;
const NMI_DB = "NMI";
const NMI_SECURITY_KEY = Bun.env["NMI_SECURITY_KEY"] ?? "6457Thfj624V5r7WUwc5v6a68Zsd6YEm";

const createNmi = async (security_key: string) => {
  return new ZNMI(security_key);
};

export default async ({ req, res, log, error }: any) => {
  try {
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
    try {
      const parsedBody = typeof req.body === "object" ? req.body : JSON.parse(req.body);
      requestData = requestInfo.parse(parsedBody);
      log("Request data parsed successfully");
    } catch (e) {
      error("Failed to parse request data:", e);
      return res.json({
        status: 400,
        message: "Invalid request format",
        error: String(e)
      }, 400);
    }

    let response: any;
  
    switch (requestData.requestCategory) {
      case RequestCategory.Transaction:
        switch (requestData.requestAction) {
          case "create":
            response = await nmi.transaction.create(requestData.data);
            break;
          case "authorize":
            response = await nmi.transaction.authorize(requestData.data);
            break;
          case "validate":
            response = await nmi.transaction.validate(requestData.data);
            break;
          case "capture":
            response = await nmi.transaction.capture(requestData.data);
            break;
          case "void":
            response = await nmi.transaction.void(requestData.data);
            break;
          case "refund":
            response = await nmi.transaction.refund(requestData.data);
            break;
          case "update":
            response = await nmi.transaction.update(requestData.data);
            break;
          default:
            return res.json({
              status: 500,
              message: "Invalid transaction action",
            });
        }
        
        await createLog(
          db,
          allDbCollInfo.database,
          allDbCollInfo.collections.transactions,
          allDbCollInfo.collections.allLogs,
          {
            ...requestData.data,
            response: response,
          },
          requestData.initiatedBy,
          log,
          error
        );
        return res.json(response);

      case RequestCategory.CustomerVault:
        switch (requestData.requestAction) {
          case "addCustomer":
            response = await nmi.customerVault.addCustomer(requestData.data);
            break;
          case "updateCustomer":
            response = await nmi.customerVault.updateCustomer(requestData.data);
            break;
          case "deleteCustomer":
            response = await nmi.customerVault.deleteCustomer(requestData.data);
            break;
          case "initiateTransaction":
            response = await nmi.customerVault.initiateTransaction(requestData.data);
            break;
          case "validateCustomer":
            response = await nmi.customerVault.validateCustomer(requestData.data);
            break;
          case "authorizeCustomer":
            response = await nmi.customerVault.authorizeCustomer(requestData.data);
            break;
          case "creditTransaction":
            response = await nmi.customerVault.creditTransaction(requestData.data);
            break;
          case "offlineTransaction":
            response = await nmi.customerVault.offlineTransaction(requestData.data);
            break;
          case "addBilling":
            response = await nmi.customerVault.addBilling(requestData.data);
            break;
          case "updateBilling":
            response = await nmi.customerVault.updateBilling(requestData.data);
            break;
          case "deleteBilling":
            response = await nmi.customerVault.deleteBilling(requestData.data);
            break;
          default:
            return res.json({
              status: 500,
              message: "Invalid customer vault action",
            });
        }
        
        await createLog(
          db,
          allDbCollInfo.database,
          allDbCollInfo.collections.customervault,
          allDbCollInfo.collections.allLogs,
          {
            ...requestData.data,
            response: response,
          },
          requestData.initiatedBy,
          log,
          error
        );
        return res.json(response);

      case RequestCategory.Query:
        switch (requestData.requestAction) {
          case "transaction":
            response = await nmi.query.queryTransaction(requestData.data);
            break;

          case "receipt":
            response = await nmi.query.queryReceipt(requestData.data);
            break;

          case "profile":
            response = await nmi.query.queryProfile(requestData.data?.includeProcessorDetails);
            break;

          case "transactionsByDate":
            response = await nmi.query.queryTransactionsByDate(
              requestData.data.startDate,
              requestData.data.endDate,
              requestData.data.options
            );
            break;

          case "customerVault":
            response = await nmi.query.queryCustomerVault(
              requestData.data?.customerVaultId,
              requestData.data?.dateRange,
              requestData.data?.options
            );
            break;

          case "recurring":
            response = await nmi.query.queryRecurring(
              requestData.data?.subscriptionId,
              requestData.data?.options
            );
            break;

          case "recurringPlans":
            response = await nmi.query.queryRecurringPlans(requestData.data?.options);
            break;

          case "invoices":
            response = await nmi.query.queryInvoices(
              requestData.data?.invoiceId,
              requestData.data?.status,
              requestData.data?.options
            );
            break;

          case "transactionsBySource":
            response = await nmi.query.queryTransactionsBySource(
              requestData.data.sources,
              requestData.data.options
            );
            break;

          case "transactionsByCondition":
            response = await nmi.query.queryTransactionsByCondition(
              requestData.data.conditions,
              requestData.data.options
            );
            break;

          case "transactionsByActionType":
            response = await nmi.query.queryTransactionsByActionType(
              requestData.data.actionTypes,
              requestData.data.options
            );
            break;

          case "transactionsByCard":
            response = await nmi.query.queryTransactionsByCard(
              requestData.data.cardNumber,
              requestData.data.options
            );
            break;

          case "transactionsWithPagination":
            response = await nmi.query.queryTransactionsWithPagination(
              requestData.data.pageNumber,
              requestData.data.resultLimit,
              requestData.data.resultOrder,
              requestData.data.options
            );
            break;

          case "gatewayProcessors":
            response = await nmi.query.queryGatewayProcessors(requestData.data?.options);
            break;

          case "accountUpdater":
            response = await nmi.query.queryAccountUpdater(requestData.data?.options);
            break;

          case "testModeStatus":
            response = await nmi.query.queryTestModeStatus(requestData.data?.options);
            break;

          default:
            return res.json({
              status: 500,
              message: "Invalid query action",
            });
        }

        await createLog(
          db,
          allDbCollInfo.database,
          allDbCollInfo.collections.queries,
          allDbCollInfo.collections.allLogs,
          {
            ...requestData.data,
            response: response,
          },
          requestData.initiatedBy,
          log,
          error
        );
        return res.json(response);

      default:
        return res.json({
          status: 500,
          message: "Invalid request category",
        });
    }
  } catch (e) {
    error("Unexpected error:", e);
    return res.json({
      status: 500,
      message: "Internal server error",
      error: String(e)
    }, 500);
  }
};