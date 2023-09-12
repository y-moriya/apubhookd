import { Hono, logger, serveStatic } from "./deps.ts";
import webfinger from "./routes/webfinger.ts";
import user from "./routes/user.ts";
import hooks from "./routes/hooks.ts";
import api from "./routes/api.ts";

const app = new Hono();

app.use("*", logger());

app.get("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => c.text("apubhook"));
app.route("/.well-known/webfinger", webfinger);
app.route("/", user);
app.route("/hooks", hooks);
app.route("/api", api);

app.showRoutes();

Deno.serve(app.fetch);
