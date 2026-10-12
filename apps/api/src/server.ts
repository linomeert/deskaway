import path from "node:path";
import { z } from "zod";
import { buildApp } from "./app";

// The production bundle has NODE_ENV inlined as "production" (see scripts/build.ts).
const isProduction = process.env.NODE_ENV === "production";

const port = z.coerce
  .number()
  .int()
  .min(0)
  .max(65535)
  .parse(process.env.PORT ?? 3000);

const app = await buildApp({
  logger: isProduction ? true : { transport: { target: "pino-pretty" } },
  webDistDir: isProduction
    ? path.resolve(import.meta.dirname, "../../web/dist")
    : undefined,
});

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
