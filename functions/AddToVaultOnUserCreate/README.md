# AddToVaultOnUserCreate

This function is designed to interact with the customer vault upon user creation, update, or deletion in an Appwrite project. It utilizes the Appwrite SDK for server-side operations and is executed automatically in response to user events.

## 🧰 Usage

This function does not directly handle HTTP methods such as GET, POST, PUT, PATCH, or DELETE. Instead, it is triggered by user creation, update, or deletion events within your Appwrite project.

Upon execution, the function checks if the user is being created or updated. If the user is new, it adds the user to the customer vault. If the user's details are being updated, it updates the user's information in the customer vault accordingly.

## ⚙️ Configuration

To set up this function in your Appwrite project, ensure the following configuration:

| Setting           | Value             |
| ----------------- | ----------------- |
| Runtime           | Bun (1.0)         |
| Entrypoint        | `src/main.ts`     |
| Build Commands    | `bun install`     |
| Permissions       | `any`             |
| Timeout (Seconds) | 15                |

## 🔒 Environment Variables

The function requires the following environment variables to be set:

- `APPWRITE_FUNCTION_PROJECT_ID`: Your Appwrite project ID.
- `APPWRITE_API_KEY`: Your Appwrite API key with permissions to access user data and execute functions.

Ensure these variables are set in your Appwrite function settings before deploying the function.

