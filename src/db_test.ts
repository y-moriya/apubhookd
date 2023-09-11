import { assertArrayIncludes, assertEquals, assertExists } from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { DenoKvDatabase } from "./db.ts";

// test for DenoKvDatabase
Deno.test("DenoKvDatabase", async (t) => {
  const kv = await Deno.openKv("data/test");
  const db = new DenoKvDatabase(kv);
  // insert test account data
  const innerDb = db["db"];
  const testAccount = {
    username: "test_username",
    displayName: "test_displayName",
    secretHookPath: "test_secretHookPath",
    iconUrl: "test_iconUrl",
    iconMime: "test_iconMime",
  };

  const testFollower1 = {
    follower: "test_follower1",
    followee: "test_followee",
  };

  const testFollower2 = {
    follower: "test_follower2",
    followee: "test_followee",
  };

  const testPost = {
    id: "test_id",
    authorUserName: "test_authorUserName",
    body: "test_body",
    createdAt: new Date(),
  };

  await t.step("add data", async () => {
    await innerDb.accounts.add(testAccount);
    await innerDb.followers.add(testFollower1);
    await innerDb.posts.add(testPost);
  });

  await t.step("getAccount", async () => {
    // test for getAccount
    const account = await db.getAccount("test_username");
    assertEquals(account, testAccount);
  });

  await t.step("getAccountBySecretHookPath", async () => {
    // test for getAccountBySecretHookPath
    const account = await db.getAccountBySecretHookPath("test_secretHookPath");
    assertEquals(account, testAccount);
  });

  await t.step("getFollowers", async () => {
    // test for getFollowers
    const followers = await db.getFollowers("test_followee");
    assertArrayIncludes(followers, [testFollower1]);
  });

  await t.step("acceptFollow", async () => {
    // test for acceptFollow
    await db.acceptFollow("test_follower2", "test_followee");
    const followers = await db.getFollowers("test_followee");
    assertArrayIncludes(followers, [testFollower1, testFollower2]);
  });

  await t.step("removeFollow", async () => {
    // test for removeFollow
    await db.removeFollow("test_follower2", "test_followee");
    const followers = await db.getFollowers("test_followee");
    assertEquals(followers, [testFollower1]);
  });

  await t.step("getPost", async () => {
    // test for getPost
    const post = await db.getPost("test_id");
    assertEquals(post, testPost);
  });

  await t.step("createPost", async () => {
    // test for createPost
    await db.createPost("test_id2", "test_authorUserName2", "test_body2");
    const post = await db.getPost("test_id2");
    assertExists(post);
    assertEquals(post.id, "test_id2");
    assertEquals(post.authorUserName, "test_authorUserName2");
    assertEquals(post.body, "test_body2");
    assertExists(post.createdAt);
  });

  await t.step("deletePost", async () => {
    // test for deletePost
    await db.deletePost("test_id2");
    const post = await db.getPost("test_id2");
    assertEquals(post, undefined);
  });

  await innerDb.accounts.deleteMany();
  await innerDb.followers.deleteMany();
  await innerDb.posts.deleteMany();
  kv.close();
});
