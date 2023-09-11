import { Hono } from "../deps.ts";
import { Env } from "../types.ts";
import { accountToActor, getServerInfo, importPrivateKey } from "../utils.ts";
import { actorJSON, followersJSON } from "../apub/actor.ts";
import { getKVDatabase } from "../db.ts";
import { acceptFollow, InboxMessage } from "../apub/follow.ts";

const app = new Hono<Env>();

app.get(":atusername", async (c) => {
  const atUsername = c.req.param("atusername");
  if (!atUsername.startsWith("@")) return c.notFound();
  const username = atUsername.substring(1);
  const server = await getServerInfo(c);
  const db = await getKVDatabase(c);
  const account = await db.getAccount(username);
  if (!account) return c.notFound();

  if (!c.req.header("Accept")?.includes("application/activity+json")) {
    return c.text(`${account.username}@${server.host}: ${account.displayName}`);
  }

  const resp = actorJSON(server, account);
  return c.json(resp, 200, { "Content-Type": "activity+json" });
});

app.get(":atusername/inbox", (c) => c.body(null, 405));
app.post(":atusername/inbox", async (c) => {
  const atUsername = c.req.param("atusername");
  if (!atUsername.startsWith("@")) return c.notFound();
  const username = atUsername.substring(1);
  const db = await getKVDatabase(c);

  if (!c.req.header("Content-Type")?.includes("application/activity+json")) {
    return c.body(null, 400);
  }
  const message = await c.req.json<InboxMessage>();

  if (message.type === "Follow") {
    const followee = await db.getAccount(username);
    if (!followee) return c.body(null, 404);

    const server = await getServerInfo(c);
    const privateKey = await importPrivateKey(Deno.env.get("PRIVATE_KEY")!);
    await acceptFollow(
      message,
      accountToActor(server, followee),
      server,
      privateKey,
    );
    await db.acceptFollow(message.actor, username);
    return c.body(null);
  }

  if (message.type === "Undo") {
    const undoTarget = message.object;
    if (undoTarget.type === "Follow") {
      const followee = await db.getAccount(username);
      if (!followee) return c.body(null, 404);

      await db.removeFollow(message.actor, username);
      return c.body(null);
    }
  }

  return c.body(null, 500);
});

app.get(":atusername/followers", async (c) => {
  const atUsername = c.req.param("atusername");
  if (!atUsername.startsWith("@")) return c.notFound();
  const username = atUsername.substring(1);
  const db = await getKVDatabase(c);

  if (!c.req.header("Accept")?.includes("application/activity+json")) {
    return c.body(null, 400);
  }

  const followers = await db.getFollowers(username);
  const followerUrls = followers.map((f) => f.follower);

  const server = await getServerInfo(c);
  const resp = followersJSON(server, username, followerUrls);
  return c.json(resp, 200, { "Content-Type": "activity+json" });
});

app.get(":atusername/s/:postId", async (c) => {
  const atUsername = c.req.param("atusername");
  if (!atUsername.startsWith("@")) return c.notFound();
  const username = atUsername.substring(1);
  const db = await getKVDatabase(c);
  const account = await db.getAccount(username);
  if (!account) return c.notFound();

  const postId = c.req.param("postId");
  const post = await db.getPost(postId);
  if (!post) return c.notFound();

  return c.json(post);
});

export default app;
