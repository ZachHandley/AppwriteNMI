# NMIHandler

## 🧰 Usage

This Appwrite function acts as a wrapper for various payment and customer management operations using the NMI payment gateway. It supports a wide range of actions, including transactions, subscriptions, customer vault operations, product management, and invoice handling.

### Endpoints

#### Transactions
- **Create Transaction**: Creates a new transaction.
- **Update Transaction**: Updates an existing transaction.
- **Validate Transaction**: Validates transaction details.
- **Authorize Transaction**: Authorizes a transaction.
- **Capture Transaction**: Captures a pre-authorized transaction.
- **Refund Transaction**: Refunds an existing transaction.
- **Void Transaction**: Voids an existing transaction.

#### Subscriptions
- **Add Recurring Plan**: Adds a new recurring plan.
- **Edit Recurring Plan**: Edits an existing recurring plan.
- **Add Custom Subscription**: Adds a custom subscription.
- **Update Subscription**: Updates an existing subscription.
- **Delete Subscription**: Deletes an existing subscription.

#### Customer Vault
- **Add Customer**: Adds a new customer to the vault.
- **Update Customer**: Updates an existing customer in the vault.
- **Initiate Transaction**: Initiates a transaction for a vaulted customer.
- **Validate Customer**: Validates a customer's details.
- **Authorize Customer**: Authorizes a transaction for a vaulted customer.
- **Credit Transaction**: Credits a transaction for a vaulted customer.
- **Offline Transaction**: Processes an offline transaction for a vaulted customer.
- **Add Billing**: Adds billing details for a customer.
- **Update Billing**: Updates billing details for a customer.
- **Delete Billing**: Deletes billing details for a customer.
- **Delete Customer**: Deletes a customer from the vault.

#### Product Manager
- **Add Product**: Adds a new product.
- **Update Product**: Updates an existing product.
- **Delete Product**: Deletes an existing product.

#### Invoices
- **Create Invoice**: Creates a new invoice.
- **Update Invoice**: Updates an existing invoice.
- **Close Invoice**: Closes an existing invoice.
- **Send Invoice**: Sends an invoice to a customer.

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Bun (1.0)     |
| Entrypoint        | `src/main.ts` |
| Build Commands    | `bun install` |
| Permissions       | `any`         |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

No environment variables required.

## Methodology

This package was born out of my frustration with the complexity of other payment APIs like Stripe. As a reseller on NMI and a frequent user of [Appwrite](https://appwrite.io) for most of my projects, my aim was to create an easy-to-integrate wrapper for the NMI Payment API. This package, along with [ZNMI](https://www.npmjs.com/package/znmi) - my TypeScript wrapper, supports basic operations such as charging a customer or creating a subscription, with the flexibility to specify custom operations for those who need more control.

Each function or route is designed to take a basic object for simple operations, or any parameter available in the NMI API for more complex, custom operations. This approach ensures that the package can be easily used for a wide range of payment processing needs, from the most straightforward to the more intricate. Additionally, I've incorporated logging for each type of function and overall operations, allowing for easy tracking and reference.

A notable feature is the seamless integration with Appwrite's collections for the Customer Vault, ensuring that sensitive information is encrypted and securely managed. This package also doubles as an API hosted on my own Appwrite instance, offering a pseudo-API for NMI's Payment Gateway. This setup is intended for easy integration into projects without the need for immediate hosting solutions, although it's not recommended as a long-term solution.

For more detailed information on each function and its parameters, please refer to the source code documentation in `src/main.ts`.

### Transaction Functions

```ts
// Create Transaction
createTransaction(transactionData?: {
  amount?: number;
  ccnumber?: string;
  ccexp?: string;
  cvv?: string;
  transactionType?: "sale" | "auth" | "credit" | "validate" | "offline";
  payment?: "creditcard" | "check";
}, additionalOptions?: Partial<TransactionRequest>): Promise<TransactionResponse>

// Authorize Transaction
authorizeTransaction(transactionData?: {
  amount?: number;
  ccnumber?: string;
  ccexp?: string;
  cvv?: string;
}, additionalOptions?: Partial<TransactionRequest>): Promise<TransactionResponse>

// Validate Transaction
validateTransaction(transactionData?: {
  ccnumber?: string;
  ccexp?: string;
  cvv?: string;
}): Promise<TransactionResponse>

// Capture Transaction
captureTransaction(transactionData?: {
  transactionid?: string;
  amount?: number;
}, additionalOptions?: Partial<CaptureTransactionRequest>): Promise<TransactionResponse>

// Refund Transaction
refundTransaction(transactionData?: {
  transactionid?: string;
  amount?: number;
}, additionalOptions?: Partial<RefundTransaction>): Promise<TransactionResponse>

// Void Transaction
voidTransaction(transactionData?: {
  transactionid?: string;
}, additionalOptions?: Partial<VoidTransactionRequest>): Promise<TransactionResponse>

// Update Transaction
updateTransaction(transactionData?: {
  transactionid?: string;
}, additionalOptions?: Partial<UpdateTransactionRequest>): Promise<TransactionResponse>
```

### Recurring/Subscription Functions

```ts
// Add Recurring Plan
addRecurringPlan(planDetails?: {
  plan_name?: string;
  plan_amount?: number;
  plan_id?: string;
  day_frequency?: number;
  month_frequency?: number;
  day_of_month?: number;
}, planData?: Partial<AddRecurringPlan>): Promise<RecurringResponse>

// Edit Recurring Plan
editRecurringPlan(planDetails?: {
  current_plan_id?: string;
  plan_name?: string;
  plan_amount?: number;
  plan_payments?: number;
  day_frequency?: number;
  month_frequency?: number;
  day_of_month?: number;
}, planData?: Partial<EditRecurringPlan>): Promise<RecurringResponse>

// Add Custom Subscription By Credit Card
addCustomSubscriptionByCc(
    subscriptionData?: {
      plan_id: string;
      start_date: string;
      amount: number;
      first_name: string;
      last_name: string;
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone: string;
      email: string;
      ccnumber: string;
      ccexp: string;
      cvv?: string;
      day_frequency?: number;
      month_frequency?: number;
      day_of_month?: number;
    },
    additionalData?: Partial<AddSubscriptionToExistingPlan>
  ): Promise<{
    status: number;
    data?: RecurringResponse;
    message: string;
  }>

// Add Custom Subscription By ACH
addCustomSubscriptionByAch(subscriptionData?: {
  plan_id: string;
  start_date: string;
  amount: number;
  first_name: string;
  last_name: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  account_type: string;
  routing: string;
  account: string;
  fullNameOnAccount: string;
  day_frequency?: number;
  month_frequency?: number;
  day_of_month?: number;
}, additionalData?: Partial<AddCustomSubscription>): Promise<RecurringResponse>

// Update Subscription
updateSubscription(subscriptionData?: {
  subscription_id: string;
  amount: number;
  plan_payments?: number;
  day_frequency?: number;
  month_frequency?: number;
  day_of_month?: number;
}, additionalData?: Partial<UpdateSubscription>): Promise<RecurringResponse>

// Delete Subscription
deleteSubscription(subscriptionData?: {
  subscription_id: string;
}, additionalData?: Partial<DeleteSubscriptionRequest>): Promise<RecurringResponse>
```

### Product Manager Functions

```ts
// Add Product
addProduct(productData?: {
  product_sku: string;
  product_description: string;
  product_cost: string;
  product_currency?: string;
  product_commodity_code?: string;
  product_unit_of_measure?: string;
  product_tax_amount?: string;
  product_discount_amount?: string;
  product_image_data?: string;
  product_image_name?: string;
}, additionalOptions?: Partial<AddProductRequest>): Promise<ProductResponse>

// Update Product
updateProduct(productData?: {
  product_id: string;
  product_sku?: string;
  product_description?: string;
  product_cost?: string;
  product_currency?: string;
  product_commodity_code?: string;
  product_unit_of_measure?: string;
  product_tax_amount?: string;
  product_discount_amount?: string;
  product_image_data?: string;
  product_image_name?: string;
}, additionalOptions?: Partial<UpdateProductRequest>): Promise<ProductResponse>

// Delete Product
deleteProduct(productData?: {
  product_id: string;
}, additionalOptions?: Partial<DeleteProductRequest>): Promise<ProductResponse>
```

### Invoice Functions

```ts
// Create Invoice
createInvoice(invoiceData?: {
  amount: number;
  email: string;
  tax?: number;
  payment_terms?: "upon_receipt" | number;
  shipping?: number;
  customer_id?: string;
  currency?: string;
  orderid?: string;
  order_description?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  fax?: string;
  website?: string;
}, additionalOptions?: Partial<CreateInvoiceRequest>): Promise<InvoiceResponse>

// Update Invoice
updateInvoice(invoiceData?: {
  invoice_id: string;
  amount?: number;
  email?: string;
  tax?: number;
  shipping?: number;
  payment_terms?: "upon_receipt" | number;
  customer_id?: string;
  currency?: string;
  orderid?: string;
  order_description?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  fax?: string;
  website?: string;
}, additionalOptions?: Partial<UpdateInvoiceRequest>): Promise<InvoiceResponse>

// Close Invoice
closeInvoice(invoiceData?: {
  invoice_id?: string;
}, additionalOptions?: Partial<CloseInvoiceRequest>): Promise<InvoiceResponse>

// Send Invoice
sendInvoice(invoiceData?: {
  email: string;
  invoice_id?: string;
}, additionalOptions?: Partial<SendInvoiceRequest>): Promise<InvoiceResponse>
```

### Customer Vault Functions

```ts
// Add Customer
async addCustomer(customerData?: {
  ccnumber?: string;
  ccexp?: string;
  customer_vault_id?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  fax?: string;
}, additionalOptions?: Partial<AddUpdateCustomerRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Update Customer
async updateCustomer(customerData?: {
  customer_vault_id: string | number;
  ccnumber?: string;
  ccexp?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  fax?: string;
}, additionalOptions?: Partial<AddUpdateCustomerRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Initiate Customer Vault Transaction
async initiateCustomerVaultTransaction(transactionData?: {
  customer_vault_id: string | number;
  amount: number;
}, additionalOptions?: Partial<CustomerVaultInitiatedTransaction>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Validate Customer By Vault ID
async validateCustomerByVaultId(validateData?: {
  customer_vault_id: string | number;
}, additionalOptions?: Partial<ValidateCustomerVaultIdRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Authorize Customer By Vault ID
async authorizeCustomerByVaultId(authorizeData?: {
  customer_vault_id: string | number;
  amount: number;
}, additionalOptions?: Partial<AuthorizeCustomerByVaultIdRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Sale By Vault ID
async saleByVaultId(saleData?: {
  customer_vault_id: string | number;
  amount: number;
  billing_id?: string;
}, additionalOptions?: Partial<SaleByVaultIdRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Credit Transaction By Vault ID
async creditTransactionByVaultId(creditData?: {
  customer_vault_id: string | number;
  amount: number;
  billing_id?: string;
}, additionalOptions?: Partial<CreditTransactionByVaultIdRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Offline Transaction By Vault ID
async offlineTransactionByVaultId(offlineData?: {
  customer_vault_id: string | number;
  amount: number;
  billing_id?: string;
}, additionalOptions?: Partial<OfflineTransactionByVaultIdRequest>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>

// Add Billing To Customer
async addBillingToCustomer(billingData?: {
  customer_vault_id: string | number;
  ccnumber?: string;
  ccexp?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
}, additionalOptions?: Partial<AddBillingForCustomerRequest>): Promise<{
  status: number;
  data?: BillingResponse;
  message: string;
}>

// Update Billing For Customer
async updateBillingForCustomer(billingData?: {
  billing_id: string;
  customer_vault_id: string | number;
  ccnumber?: string;
  ccexp?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
}, additionalOptions?: Partial<UpdateBillingForCustomerRequest>): Promise<{
  status: number;
  data?: BillingResponse;
  message: string;
}>

// Delete Billing For Customer
async deleteBillingForCustomer(deleteData?: {
  billing_id: string;
  customer_vault_id: string | number;
}, additionalOptions?: Partial<DeleteBillingForCustomerRequest>): Promise<{
  status: number;
  data?: BillingResponse;
  message: string;
}>

async deleteCustomerRecord(deleteData?: {
  customer_vault_id: string | number;
}, additionalOptions?: Partial<DeleteCustomerRecord>): Promise<{
  status: number;
  data?: CustomerVaultResponse;
  message: string;
}>
```
