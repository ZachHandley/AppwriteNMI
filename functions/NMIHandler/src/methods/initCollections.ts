import { Databases, Query, ID, Permission } from "node-appwrite";
import {
  ProductResponseSchema,
  TransactionResponseSchema,
  RecurringResponseSchema,
  InvoiceResponseSchema,
  CustomerVaultResponseSchema,
  QueryResponseSchema,
} from "znmi";
import { z } from "zod";

const ProductResponseType = ProductResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
}).shape;

const TransactionResponseType = TransactionResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
}).shape;

const RecurringResponseType = RecurringResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
}).shape;

const InvoiceResponseType = InvoiceResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
}).shape;

const CustomerVaultResponseType = CustomerVaultResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
}).shape;

const QueryResponseType = QueryResponseSchema.extend({
  initiatedBy: z.string().optional(),
  usersAffected: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
  status: z.string().optional(),
  error: z.any().optional(),
}).shape;

const logType = ProductResponseSchema.merge(TransactionResponseSchema)
  .merge(RecurringResponseSchema)
  .merge(InvoiceResponseSchema)
  .merge(CustomerVaultResponseSchema)
  .merge(QueryResponseSchema)
  .extend({
    initiatedBy: z.string().optional(),
    usersAffected: z.array(z.string()).optional(),
    timestamp: z.string().optional(),
    collectionSource: z.string().optional(),
    status: z.string().optional(),
    error: z.any().optional(),
  }).shape;

const createAppwriteAttributesFromZod = async (
  log: any,
  db: Databases,
  databaseId: string,
  collectionId: string,
  shape: z.ZodRawShape
) => {
  log(`Creating attributes for collection ${collectionId}`);
  for (const key in shape) {
    const field = shape[key];
    log(`Creating attribute for key ${key}`);
    try {
      let unwrappedField = field;
      if (field instanceof z.ZodOptional) {
        unwrappedField = field.unwrap();
      }
      if (
        unwrappedField instanceof z.ZodString ||
        unwrappedField instanceof z.ZodUnion
      ) {
        log(`Creating string attribute for key ${key}`);
        await db.createStringAttribute(
          databaseId,
          collectionId,
          key,
          255,
          !field.isOptional(),
          undefined,
          false,
          false
        );
      } else if (unwrappedField instanceof z.ZodNumber) {
        log(`Creating number attribute for key ${key}`);
        await db.createFloatAttribute(
          databaseId,
          collectionId,
          key,
          !field.isOptional(),
          undefined,
          undefined,
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodBoolean) {
        log(`Creating boolean attribute for key ${key}`);
        await db.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          !field.isOptional(),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodDate) {
        log(`Creating date attribute for key ${key}`);
        await db.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          !field.isOptional(),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodEnum) {
        log(`Creating enum attribute for key ${key}`);
        const elements = unwrappedField.options
          .map((option: any) => option.toString())
          .filter((option: any) => option !== "");
        await db.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          elements,
          !field.isOptional() &&
            elements.some((element: any) => element !== ""),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodArray) {
        const arrayType = unwrappedField.element;
        log(`Creating array attribute for key ${key}`);
        if (arrayType instanceof z.ZodString) {
          log(`Creating string array attribute for key ${key}`);
          await db.createStringAttribute(
            databaseId,
            collectionId,
            key,
            255,
            !field.isOptional(),
            undefined,
            true,
            false
          );
        } else if (arrayType instanceof z.ZodNumber) {
          log(`Creating number array attribute for key ${key}`);
          await db.createFloatAttribute(
            databaseId,
            collectionId,
            key,
            !field.isOptional(),
            undefined,
            undefined,
            undefined,
            true
          );
        } else if (arrayType instanceof z.ZodBoolean) {
          log(`Creating boolean array attribute for key ${key}`);
          await db.createBooleanAttribute(
            databaseId,
            collectionId,
            key,
            !field.isOptional(),
            undefined,
            true
          );
        } else if (arrayType instanceof z.ZodDate) {
          log(`Creating date array attribute for key ${key}`);
          await db.createDatetimeAttribute(
            databaseId,
            collectionId,
            key,
            !field.isOptional(),
            undefined,
            true
          );
        } else if (arrayType instanceof z.ZodEnum) {
          log(`Creating enum array attribute for key ${key}`);
          await db.createEnumAttribute(
            databaseId,
            collectionId,
            key,
            arrayType.options.map((option: any) => option.toString()),
            !field.isOptional(),
            undefined,
            true
          );
        }
      }
    } catch (error) {
      log(`Failed to create attribute for key ${key}:`, error);
      log(`Attribute stringified: ${JSON.stringify(field, null, 4)}`);
    }
  }
};

export const createCollections = async (
  db: Databases,
  database_id: string,
  log: any
) => {
  const existingCollectionsResult = await db.listCollections(database_id);
  const existingCollections = existingCollectionsResult.collections.map(
    (c) => c.name
  );
  let allCollections: { [key: string]: string } = {};

  const checkAndCreateCollection = async (
    collectionName: string,
    responseType: any
  ) => {
    if (!existingCollections.includes(collectionName)) {
      log(`Creating collection: ${collectionName}`);
      const collection = await db.createCollection(
        database_id,
        ID.unique(),
        collectionName,
        [Permission.read("any")]
      );
      allCollections[collectionName.toLowerCase().replace(" ", "")] = collection.$id;
      await createAppwriteAttributesFromZod(
        log,
        db,
        database_id,
        collection.$id,
        responseType
      );
    } else {
      log(`Collection exists: ${collectionName}`);
      const collectionId = existingCollectionsResult.collections.find(
        (c) => c.name === collectionName
      )!.$id;
      allCollections[collectionName.toLowerCase().replace(" ", "")] = collectionId;
      
      // Check for missing attributes
      const existingAttributes = await db.listAttributes(database_id, collectionId);
      const existingAttributeNames = existingAttributes.attributes.map(attr => attr.key);
      
      // Create any missing attributes
      for (const [key, schema] of Object.entries(responseType)) {
        if (!existingAttributeNames.includes(key)) {
          log(`Creating missing attribute: ${key}`);
          await createAppwriteAttributesFromZod(
            log,
            db,
            database_id,
            collectionId,
            { [key]: schema }
          );
        }
      }
    }
  };

  // Create all collections
  await checkAndCreateCollection("Products", ProductResponseType);
  await checkAndCreateCollection("Transactions", TransactionResponseType);
  await checkAndCreateCollection("Subscriptions", RecurringResponseType);
  await checkAndCreateCollection("Invoices", InvoiceResponseType);
  await checkAndCreateCollection("Customer Vault", CustomerVaultResponseType);
  await checkAndCreateCollection("Queries", QueryResponseType);
  await checkAndCreateCollection("Gateway Logs", logType);

  return allCollections;
};

export const initCollections = async (
  db: Databases,
  database_name: string,
  log: any,
  error: any
) => {
  const databases = await db.list([Query.equal("name", database_name)]);
  if (databases.total === 0) {
    // Create database and collections
    const database = await db.create(ID.unique(), database_name, true);
    const createdCollections = await createCollections(db, database.$id, log);
    return {
      database: database.$id,
      collections: createdCollections,
    };
  } else {
    // Check existing collections
    const database = databases.databases[0];
    const createdCollections = await createCollections(db, database.$id, log);
    return {
      database: database.$id,
      collections: createdCollections,
    };
  }
};