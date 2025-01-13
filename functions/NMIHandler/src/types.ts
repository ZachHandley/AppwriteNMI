import { z } from "zod";

// Define the request categories
export const RequestCategory = {
  Transaction: "transaction",
  Subscription: "subscription",
  CustomerVault: "customerVault",
  ProductManager: "productManager",
  Invoice: "invoice",
  Query: "query",
} as const;

// Define the request categories as per your existing schema
const requestCategory = z.enum([
  RequestCategory.Transaction,
  RequestCategory.Subscription,
  RequestCategory.CustomerVault,
  RequestCategory.ProductManager,
  RequestCategory.Invoice,
  RequestCategory.Query,
]);

// Define possible actions. These are inferred from your README examples.
const transactionRequestActions = z.enum([
  "create",
  "authorize",
  "validate",
  "capture",
  "refund",
  "void",
  "update",
]);

const subscriptionRequestActions = z.enum([
  "addPlan",
  "editPlan",
  "addCustomByAch",
  "addCustomByCreditCard",
  "updateSubscription",
  "deleteSubscription",
]);

const customerVaultRequestActions = z.enum([
  "addCustomer",
  "updateCustomer",
  "initiateTransaction",
  "validateCustomer",
  "authorizeCustomer",
  "creditTransaction",
  "offlineTransaction",
  "addBilling",
  "updateBilling",
  "deleteBilling",
  "deleteCustomer",
]);

const productManagerRequestActions = z.enum([
  "addProduct",
  "updateProduct",
  "deleteProduct",
]);

const invoiceRequestActions = z.enum([
  "create",
  "update",
  "close",
  "send"
]);

const queryRequestActions = z.enum([
  "transaction",
  "receipt",
  "profile",
  "transactionsByDate",
  "customerVault",
  "recurring",
  "recurringPlans",
  "invoices",
  "transactionsBySource",
  "transactionsByCondition",
  "transactionsByActionType",
  "transactionsByCard",
  "transactionsWithPagination",
  "gatewayProcessors",
  "accountUpdater",
  "testModeStatus"
]);

// Now we need to define each possible combination of request category and action
const transactionRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.Transaction),
  requestAction: transactionRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const subscriptionRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.Subscription),
  requestAction: subscriptionRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const customerVaultRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.CustomerVault),
  requestAction: customerVaultRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const productManagerRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.ProductManager),
  requestAction: productManagerRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const invoiceRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.Invoice),
  requestAction: invoiceRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const queryRequestInfo = z.object({
  requestCategory: z.literal(RequestCategory.Query),
  requestAction: queryRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

// Combine all the request info schemas into a single union
const requestInfo = z.discriminatedUnion("requestCategory", [
  transactionRequestInfo,
  subscriptionRequestInfo,
  customerVaultRequestInfo,
  productManagerRequestInfo,
  invoiceRequestInfo,
  queryRequestInfo,
]);

export { 
  requestInfo,
  requestCategory,
  transactionRequestActions,
  subscriptionRequestActions,
  customerVaultRequestActions,
  productManagerRequestActions,
  invoiceRequestActions,
  queryRequestActions,
};

// Export types for convenience
export type RequestInfo = z.infer<typeof requestInfo>;
export type RequestCategory = z.infer<typeof requestCategory>;
export type TransactionRequestActions = z.infer<typeof transactionRequestActions>;
export type SubscriptionRequestActions = z.infer<typeof subscriptionRequestActions>;
export type CustomerVaultRequestActions = z.infer<typeof customerVaultRequestActions>;
export type ProductManagerRequestActions = z.infer<typeof productManagerRequestActions>;
export type InvoiceRequestActions = z.infer<typeof invoiceRequestActions>;
export type QueryRequestActions = z.infer<typeof queryRequestActions>;