import {
  accountToActor,
  getPublicKeyPem,
  getServerInfo,
  importPrivateKey,
} from "./utils.ts";
import { assertEquals } from "https://deno.land/std@0.194.0/testing/asserts.ts";

// test for accountToActor
Deno.test("accountToActor", () => {
  const serverInfo = {
    host: "example.com",
    publicKeyPem: "-----BEGIN PUBLIC KEY-----\n" +
      "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEsBfJXyqJg7H2dUzI+6l+Qa3Y6kY7\n" +
      "YJ4Yn3yD3eX1K3Hc2m5q+uK/2k4J7jDy5t1Nf8H7Df4LjyY3I2wYwMhN4w==\n" +
      "-----END PUBLIC KEY-----\n",
  };
  // APubHookAccount
  const account = {
    username: "alice",
    displayName: "Alice",
    secretHookPath: "/secret/alice",
    iconUrl: "https://example.com/alice.png",
    iconMime: "image/png",
  };
  // Actor
  const actor = {
    preferredUsername: "alice",
    inbox: "https://example.com/@alice/inbox",
  };
  assertEquals(accountToActor(serverInfo, account), actor);
});

// test for importPrivateKey
Deno.test("importPrivateKey", async () => {
  const pem = (await Deno.readTextFile("src/test/private.pem")).trim();
  const privateKey = await importPrivateKey(pem);
  assertEquals(privateKey.type, "private");
});

Deno.test("getServerInfo", async () => {
  const env = {
    PRIVATE_KEY: (await Deno.readTextFile("src/test/private.pem")).trim(),
  };
  const c = {
    req: {
      url: "https://example.com/",
    },
    env,
  };
  const serverInfo = await getServerInfo(c as any);
  assertEquals(serverInfo.host, "example.com");
  assertEquals(
    serverInfo.publicKeyPem,
    await getPublicKeyPem(c.env.PRIVATE_KEY),
  );
});
