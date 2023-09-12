import { getKVDatabase } from "../db.ts";
import { Hono, z } from "../deps.ts";
import { zValidator } from "../lib/zValidator.ts";
import { Env } from "../types.ts";

const app = new Hono<Env>();

const requestSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().min(1),
  secretHookPath: z.string().min(1),
  iconUrl: z.string().min(1),
  iconMime: z.string().min(1),
});

app.post(
  "/createAccount/" + Deno.env.get("CREATE_ACCOUNT_ENDPOINT_UUID"),
  zValidator("json", requestSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const db = await getKVDatabase(c);

    const existingAccount = await db.getAccount(payload.username);
    if (existingAccount) {
      // return error to create account
      return c.json({
        "success": false,
        "message": "Account username already exists",
      });
    }

    const existingAccountBySecretHookPath = await db.getAccountBySecretHookPath(
      payload.secretHookPath,
    );
    if (existingAccountBySecretHookPath) {
      // return error to create account
      return c.json({
        "success": false,
        "message": "Secret hook path already exists",
      });
    }

    await db.createAccount({
      username: payload.username,
      displayName: payload.displayName,
      secretHookPath: payload.secretHookPath,
      iconUrl: payload.iconUrl,
      iconMime: payload.iconMime,
    });

    // return success to create account
    return c.json({ "success": true });
  },
);

export default app;
