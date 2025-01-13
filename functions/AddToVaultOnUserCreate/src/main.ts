import { Client, Users, Functions } from 'node-appwrite';

// Alternatively, import `znmi` and just use it
const NMIHandlerFuncId = "yournmihandlerfuncid";


// const customerVaultRequestInfo = z.object({
//   requestCategory: z.literal("customerVault"),
//   requestAction: customerVaultRequestActions,
//   initiatedBy: z.string(),
//   data: z.any(),
// });

// Executed when a user is created, deleted, or updated
export default async ({ req, res, log, error }: any) => {
  const trigger = req.headers["x-appwrite-trigger"];
  const event = req.headers["x-appwrite-event"] as string;
  
  if (trigger !== "event" || !event.includes("users")) {
    log("Ignoring non-user event trigger");
    return res.empty();
  }

  // Set up client and services
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    // @ts-ignore
    .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
    // @ts-ignore
    .setKey(Bun.env["APPWRITE_API_KEY"]);
  const functions = new Functions(client);
  
  const reqUserId = req.headers["x-appwrite-user-id"];
  let data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const userId = data.$id;

  try {
    if (event.includes("create") || event.includes("update")) {
      const users = new Users(client);
      const user = await users.get(userId);
      
      const action = user.$createdAt !== user.$updatedAt ? "updateCustomer" : "addCustomer";
      
      await functions.createExecution(NMIHandlerFuncId, JSON.stringify({
        requestCategory: "customerVault",
        requestAction: action,
        initiatedBy: reqUserId || user.$id,
        data: {
          email: user.email,
          customer_vault_id: user.$id,
          first_name: user.name.split(" ")[0],
          last_name: user.name.split(" ")[1],
          phone: user.phone,
        },
      }), true, undefined, "POST", {
        "Content-Type": "application/json",
      });
      
      log(`User ${action === "addCustomer" ? "added to" : "updated in"} vault`);
    } else if (event.includes("delete")) {
      await functions.createExecution(NMIHandlerFuncId, JSON.stringify({
        requestCategory: "customerVault",
        requestAction: "deleteCustomer",
        initiatedBy: reqUserId || userId,
        data: {
          customer_vault_id: userId,
        },
      }), true, undefined, "POST", {
        "Content-Type": "application/json",
      });
      
      log("User deleted from vault");
    } else {
      log(`Ignoring unhandled event: ${event}`);
    }
    
    return res.empty();
  } catch (e) {
    error(e);
    return res.json({ error: String(e) }, 500);
  }
};
