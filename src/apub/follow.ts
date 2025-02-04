import { Actor, fetchRemoteActor, getActorUrl } from "./actor.ts";
import { postToRemoteInbox, ServerInfo, UrlString } from "./common.ts";
import { signHeaders } from "./sign.ts";

export type InboxMessage =
  | FollowRequest
  | UndoRequest;

export type FollowRequest = {
  type: "Follow";
  actor: UrlString; // URL of follower actor
  object: UrlString; // URL of followee actor
};

export type UndoRequest = {
  type: "Undo";
  actor: UrlString;
  object: InboxMessage;
};

export async function acceptFollow(
  followRequest: FollowRequest,
  followee: Actor,
  server: ServerInfo,
  privateKey: CryptoKey,
) {
  const follower = await fetchRemoteActor(followRequest.actor);
  const myUrl = followRequest.object;
  const res = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${myUrl}/s/${crypto.randomUUID()}`,
    type: "Accept",
    actor: myUrl,
    object: followRequest,
  };
  const headers = await signHeaders(
    res,
    server,
    followee,
    follower.inbox,
    privateKey,
  );
  await postToRemoteInbox(follower.inbox, res, headers);
}
