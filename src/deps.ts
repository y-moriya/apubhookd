import { Hono, validator } from "https://deno.land/x/hono@v3.5.8/mod.ts";
import { serveStatic } from "https://deno.land/x/hono@v3.5.8/adapter/deno/index.ts";
import { logger } from "https://deno.land/x/hono@v3.5.8/middleware/logger/index.ts";
import { z, ZodError, ZodSchema } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import {
  Context,
  Env,
  MiddlewareHandler,
  TypedResponse,
  ValidationTargets,
} from "https://deno.land/x/hono@v3.5.8/mod.ts";
import type {
  DB,
  Model,
  SchemaDefinition,
} from "https://deno.land/x/kvdex/mod.ts";
import { indexableCollection, kvdex } from "https://deno.land/x/kvdex/mod.ts";

export type {
  Context,
  DB,
  Env,
  MiddlewareHandler,
  Model,
  SchemaDefinition,
  TypedResponse,
  ValidationTargets,
};
export {
  Hono,
  indexableCollection,
  kvdex,
  logger,
  serveStatic,
  validator,
  z,
  ZodError,
  ZodSchema,
};
