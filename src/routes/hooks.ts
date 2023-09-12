import { Hono, z } from "../deps.ts";
import { zValidator } from "../lib/zValidator.ts";
import { accountToActor, getServerInfo, importPrivateKey } from "../utils.ts";
import { Env } from "../types.ts";
import { getKVDatabase } from "../db.ts";
import { fetchRemoteActor, getActorUrl } from "../apub/actor.ts";
import { createNote } from "../apub/note.ts";

const app = new Hono<Env>();

const requestSchema = z.object({
  text: z.string().min(1),
});

app.post(
  "/:secretHookPath",
  zValidator("json", requestSchema),
  async (c) => {
    const hookPath = c.req.param("secretHookPath");
    const payload = c.req.valid("json");

    const db = await getKVDatabase(c);
    const account = await db.getAccountBySecretHookPath(hookPath);
    if (!account) return c.notFound();

    const server = await getServerInfo(c);
    const accountActor = accountToActor(server, account);
    const privateKey = await importPrivateKey(Deno.env.get("PRIVATE_KEY")!);
    const postId = crypto.randomUUID();

    const followers = await db.getFollowers(account.username);
    console.log(
      `${account.username} posting ${
        JSON.stringify(payload)
      } to ${followers.length} followers`,
    );
    for (const follower of followers) {
      const followerActor = await fetchRemoteActor(follower.follower);
      await createNote(
        postId,
        server,
        accountActor,
        followerActor.inbox,
        payload.text,
        privateKey,
      );
    }
    await db.createPost(postId, account.username, payload.text);
    const actorBaseUrl = getActorUrl(server, account.username);
    return c.json({ "url": `${actorBaseUrl}/s/${postId}` });
  },
);

export default app;
