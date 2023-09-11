import { UrlString } from "./apub/common.ts";
import type { Model } from "./deps.ts";

export type Env = {
  Bindings: {
    DB: any;
    PRIVATE_KEY: string;
  };
};

export interface APubHookAccount extends Model {
  username: string;
  displayName: string;
  secretHookPath: string;
  iconUrl: string;
  iconMime: string;
}

export interface Follower extends Model {
  follower: UrlString;
  followee: UrlString;
}

export interface Post extends Model {
  id: string;
  authorUserName: string;
  body: string;
  createdAt: Date;
}
