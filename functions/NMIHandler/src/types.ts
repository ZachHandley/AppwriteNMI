import { z } from "zod";

// Assuming the detailed request data schemas are defined elsewhere as per your README
// and imported here as necessary.

// Define the request categories as per your existing schema
const requestCategory = z.enum([
  "transaction",
  "subscription",
  "customerVault",
  "productManager",
  "invoice",
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

const invoiceRequestActions = z.enum(["create", "update", "close", "send"]);

// Now we need to define each possible combination of request category and action
const transactionRequestInfo = z.object({
  requestCategory: z.literal("transaction"),
  requestAction: transactionRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const subscriptionRequestInfo = z.object({
  requestCategory: z.literal("subscription"),
  requestAction: subscriptionRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const customerVaultRequestInfo = z.object({
  requestCategory: z.literal("customerVault"),
  requestAction: customerVaultRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const productManagerRequestInfo = z.object({
  requestCategory: z.literal("productManager"),
  requestAction: productManagerRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

const invoiceRequestInfo = z.object({
  requestCategory: z.literal("invoice"),
  requestAction: invoiceRequestActions,
  initiatedBy: z.string(),
  data: z.any(),
});

// Combine all the request info schemas into a single union
const requestInfo = transactionRequestInfo
  .or(subscriptionRequestInfo)
  .or(customerVaultRequestInfo)
  .or(productManagerRequestInfo)
  .or(invoiceRequestInfo);

export { requestInfo };
