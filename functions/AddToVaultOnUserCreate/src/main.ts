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
  // Why not try the Appwrite SDK?
  const client = new Client()
     .setEndpoint('https://cloud.appwrite.io/v1')
     // @ts-ignore
     .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
      // @ts-ignore
     .setKey(Bun.env["APPWRITE_API_KEY"]);
  const users = new Users(client);
  const functions = new Functions(client);
  const reqUserId = req.headers["x-appwrite-user-id"];
  let data;
  if (typeof req.body === "string") {
    data = req.body = JSON.parse(req.body);
  } else {
    data = req.body;
  }
  const userId = data.$id;
  try {
    // Should always work except maybe for deleted users
    const user = await users.get(userId);
    // In theory this should work lol
    if (user.$createdAt !== user.$updatedAt) {
      await functions.createExecution(NMIHandlerFuncId, JSON.stringify({
        requestCategory: "customerVault",
        requestAction: "updateCustomer",
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
      log("User updated in vault")
      return res.empty();
    }
    await functions.createExecution(NMIHandlerFuncId, JSON.stringify({
      requestCategory: "customerVault",
      requestAction: "addCustomer",
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
    log("User added to vault")
    return res.empty();
  } catch (e) {
    error(e);
  }
};
