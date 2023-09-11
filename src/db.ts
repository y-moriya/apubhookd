/// <reference lib="deno.unstable" />

import { type Context, indexableCollection, kvdex } from "./deps.ts";
import { APubHookAccount, Env, Follower, Post } from "./types.ts";
import { UrlString } from "./apub/common.ts";

export interface IDatabase {
  getAccount(username: string): Promise<APubHookAccount | undefined>;
  getAccountBySecretHookPath(secretHookPath: string): Promise<APubHookAccount | undefined>;
  getFollowers(username: string): Promise<Follower[]>;
  acceptFollow(followerUrl: UrlString, followeeUsername: string): Promise<void>;
  removeFollow(followerUrl: UrlString, followeeUsername: string): Promise<void>;
  getPost(postId: string): Promise<Post | undefined>;
  createPost(postId: string, username: string, body: string): Promise<void>;
  deletePost(postId: string): Promise<void>;
}

export class DenoKvDatabase implements IDatabase {
  private readonly db;

  constructor(kv: Deno.Kv) {
    this.db = kvdex(kv, {
      accounts: indexableCollection<APubHookAccount>().build({
        indices: {
          username: "primary",
          secretHookPath: "primary",
        },
      }),
      followers: indexableCollection<Follower>().build({
        indices: {
          follower: "secondary",
          followee: "secondary",
        },
      }),
      posts: indexableCollection<Post>().build({
        indices: {
          id: "primary",
        },
      }),
    });
  }

  getAccount(username: string): Promise<APubHookAccount | undefined> {
    return this.db.accounts.findByPrimaryIndex("username", username).then(
      (res) => {
        return res?.value;
      },
    );
  }
  getAccountBySecretHookPath(secretHookPath: string): Promise<APubHookAccount | undefined> {
    return this.db.accounts.findByPrimaryIndex("secretHookPath", secretHookPath)
      .then((res) => {
        return res?.value;
      });
  }
  getFollowers(username: string): Promise<Follower[]> {
    return this.db.followers.findBySecondaryIndex("followee", username).then(
      (res) => {
        return res!.result.map((r) => r.value);
      },
    );
  }
  acceptFollow(followerUrl: string, followeeUsername: string): Promise<void> {
    return this.db.followers.add({
      follower: followerUrl,
      followee: followeeUsername,
    }).then((res) => {
      console.log(res);
    });
  }
  removeFollow(followerUrl: string, followeeUsername: string): Promise<void> {
    return this.db.followers.deleteMany({
      filter: (doc) =>
        doc.value.followee === followeeUsername &&
        doc.value.follower === followerUrl,
    }).then((res) => {
      console.log(res);
    });
  }
  getPost(postId: string): Promise<Post | undefined> {
    return this.db.posts.findByPrimaryIndex("id", postId).then((res) => {
      return res?.value;
    });
  }
  createPost(postId: string, username: string, body: string): Promise<void> {
    return this.db.posts.add({
      id: postId,
      authorUserName: username,
      body: body,
      createdAt: new Date(),
    }).then((res) => {
      console.log(res);
    });
  }
  deletePost(postId: string): Promise<void> {
    return this.db.posts.deleteMany({
      filter: (doc) => doc.value.id === postId,
    }).then((res) => {
      console.log(res);
    });
  }
}

export async function getKVDatabase(c: Context<Env>): Promise<IDatabase> {
  return new DenoKvDatabase(await Deno.openKv(c.env.DB));
}
