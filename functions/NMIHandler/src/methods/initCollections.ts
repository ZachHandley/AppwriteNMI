import { Databases, Query, ID, Permission } from "node-appwrite";
import {
  ProductResponseSchema,
  TransactionResponseSchema,
  RecurringResponseSchema,
  InvoiceResponseSchema,
  CustomerVaultResponseSchema,
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

const logType = ProductResponseSchema.merge(TransactionResponseSchema)
  .merge(RecurringResponseSchema)
  .merge(InvoiceResponseSchema)
  .merge(CustomerVaultResponseSchema).extend({
    initiatedBy: z.string().optional(),
    usersAffected: z.array(z.string()).optional(),
  }).shape;

export const initCollections = async (
  db: Databases,
  database_name: string,
  log: any,
  error: any
) => {
  const databases = await db.list([Query.equal("name", database_name)]);
  if (databases.total === 0) {
    // We need to create the database and collections
    const database = await db.create(ID.unique(), database_name, true);
    await createCollections(db, database.$id, log);
  } else {
    // We need to check the collections
    const database = databases.databases[0];
    await createCollections(db, database.$id, log);
  }
};

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
      if (unwrappedField instanceof z.ZodString || unwrappedField instanceof z.ZodUnion) {
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
        const elements = unwrappedField.options.map((option: any) => option.toString()).filter((option: any) => option !== "");
        await db.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          elements,
          !field.isOptional() && elements.some((element: any) => element !== ""),
          undefined,
          false
        );
        log(`Created enum attribute for key ${key}`);
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
        } else if (arrayType instanceof z.ZodLiteral) {
          log(`Creating enum array attribute for key ${key}`);
          await db.createEnumAttribute(
            databaseId,
            collectionId,
            key,
            [arrayType.value.map((option: any) => option.toString())],
            !field.isOptional(),
            undefined,
            true
          );
        }
        log(`Created array attribute for key ${key}`);
        // Note: Appwrite might not support complex nested arrays directly, so you might need to serialize them or handle them as strings.
      } else if (unwrappedField instanceof z.ZodObject) {
        // For ZodObject, consider serializing to a string or handling as a map if supported.
      } else if (
        unwrappedField instanceof z.ZodUnion ||
        unwrappedField instanceof z.ZodDiscriminatedUnion
      ) {
        // Union types might need to be handled as strings or using specific logic to map to Appwrite's attribute types.
      } else if (unwrappedField instanceof z.ZodIntersection) {
        // Intersection types might need custom handling, potentially serializing to a string.
      } else if (unwrappedField instanceof z.ZodTuple) {
        // Tuples might be handled similarly to arrays or serialized to strings.
      } else if (unwrappedField instanceof z.ZodRecord) {
        // Records might be handled as maps if supported, or serialized to strings.
      } else if (unwrappedField instanceof z.ZodLiteral) {
        // Literals might be handled as specific constant values or enums.
      } else if (
        unwrappedField instanceof z.ZodNull ||
        unwrappedField instanceof z.ZodUndefined
      ) {
        // These types might be handled specifically based on your application's needs, potentially as optional attributes.
      }
      // Add more Zod types as necessary
    } catch (error) {
      log(`Failed to create attribute for key ${key}:`, error);
      log(`Attribute stringified: ${JSON.stringify(field, null, 4)}`);
    }
  }
};

async function createAppwriteAttributeFromZod(
    db: Databases,
    databaseId: string,
    collectionId: string,
    attributeName: string,
    attributeSchema: z.ZodType<any>,
    log: any
  ) {
    log(`Creating attribute for ${attributeName}`);
    try {
      let unwrappedField = attributeSchema;
      if (attributeSchema instanceof z.ZodOptional) {
        unwrappedField = attributeSchema.unwrap();
      }
      if (unwrappedField instanceof z.ZodString || unwrappedField instanceof z.ZodUnion) {
        log(`Creating string attribute for ${attributeName}`);
        await db.createStringAttribute(
          databaseId,
          collectionId,
          attributeName,
          255,
          !attributeSchema.isOptional(),
          undefined,
          false,
          false
        );
      } else if (unwrappedField instanceof z.ZodNumber) {
        log(`Creating number attribute for ${attributeName}`);
        await db.createFloatAttribute(
          databaseId,
          collectionId,
          attributeName,
          !attributeSchema.isOptional(),
          undefined,
          undefined,
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodBoolean) {
        log(`Creating boolean attribute for ${attributeName}`);
        await db.createBooleanAttribute(
          databaseId,
          collectionId,
          attributeName,
          !attributeSchema.isOptional(),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodDate) {
        log(`Creating date attribute for ${attributeName}`);
        await db.createDatetimeAttribute(
          databaseId,
          collectionId,
          attributeName,
          !attributeSchema.isOptional(),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodEnum) {
        log(`Creating enum attribute for ${attributeName}`);
        const elements = unwrappedField.options.map(option => option.toString()).filter(option => option !== "");
        await db.createEnumAttribute(
          databaseId,
          collectionId,
          attributeName,
          elements,
          !attributeSchema.isOptional() && elements.some(element => element !== ""),
          undefined,
          false
        );
      } else if (unwrappedField instanceof z.ZodArray) {
        const arrayType = unwrappedField.element;
        log(`Creating array attribute for ${attributeName}`);
        if (arrayType instanceof z.ZodString) {
          log(`Creating string array attribute for ${attributeName}`);
          await db.createStringAttribute(
            databaseId,
            collectionId,
            attributeName,
            255,
            !attributeSchema.isOptional(),
            undefined,
            true,
            false
          );
        } else if (arrayType instanceof z.ZodNumber) {
          log(`Creating number array attribute for ${attributeName}`);
          await db.createFloatAttribute(
            databaseId,
            collectionId,
            attributeName,
            !attributeSchema.isOptional(),
            undefined,
            undefined,
            undefined,
            true
          );
        } else if (arrayType instanceof z.ZodBoolean) {
          log(`Creating boolean array attribute for ${attributeName}`);
          await db.createBooleanAttribute(
            databaseId,
            collectionId,
            attributeName,
            !attributeSchema.isOptional(),
            undefined,
            true
          );
        } else if (arrayType instanceof z.ZodDate) {
          log(`Creating date array attribute for ${attributeName}`);
          await db.createDatetimeAttribute(
            databaseId,
            collectionId,
            attributeName,
            !attributeSchema.isOptional(),
            undefined,
            true
          );
        }
        // Note: Appwrite might not support complex nested arrays directly, so you might need to serialize them or handle them as strings.
      } else {
        log(`Unsupported Zod type for attribute: ${attributeName}`);
      }
    } catch (error) {
      log(`Failed to create attribute for ${attributeName}:`, error);
      log(`Attribute stringified: ${JSON.stringify(attributeSchema, null, 4)}`);
    }
  }

export const createCollections = async (
    db: Databases,
    database_id: string,
    log: any
  ) => {
    const existingCollectionsResult = await db.listCollections(database_id);
    const existingCollections = existingCollectionsResult.collections.map(c => c.name);
  
    // Define a helper function to check and create collections
    const checkAndCreateCollection = async (collectionName: string, responseType: any) => {
      if (!existingCollections.includes(collectionName)) {
        log(`Creating collection: ${collectionName}`);
        const collection = await db.createCollection(
          database_id,
          ID.unique(),
          collectionName,
          [Permission.read("any")]
        );
        await createAppwriteAttributesFromZod(
          log,
          db,
          database_id,
          collection.$id,
          responseType,
        );
    } else {
        log(`Collection already exists: ${collectionName}`);
        const collectionId = existingCollectionsResult.collections.find(c => c.name === collectionName)!.$id;
        const collectionAttributesResult = await db.listAttributes(database_id, collectionId);
        const existingAttributeNames = collectionAttributesResult; // Assuming this returns a string array of attribute names

        // Extract attribute names from the Zod schema
        const responseAttributeNames = Object.keys(responseType.shape);

        // Determine which attributes are missing
        const missingAttributes = responseAttributeNames.filter(name => !existingAttributeNames.attributes.includes(name));

        // Create missing attributes
        for (const attributeName of missingAttributes) {
          log(`Creating missing attribute: ${attributeName} for collection: ${collectionName}`);
          // Extract the Zod schema for the attribute
          const attributeSchema = responseType.shape[attributeName];
          await createAppwriteAttributeFromZod(
            db,
            database_id,
            collectionId,
            attributeName,
            attributeSchema,
            log
          );
        }
      }
    };
  
    // Use the helper function for each collection
    await checkAndCreateCollection("Products", ProductResponseType);
    await checkAndCreateCollection("Transactions", TransactionResponseType);
    await checkAndCreateCollection("Subscriptions", RecurringResponseType);
    await checkAndCreateCollection("Invoices", InvoiceResponseType);
    await checkAndCreateCollection("Customer Vault", CustomerVaultResponseType);
    await checkAndCreateCollection("Gateway Logs", logType);
  };