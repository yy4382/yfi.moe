import { pino } from "pino";
import { factory } from "./factory.js";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL ?? "info",
});

export const pinoMiddleware = factory.createMiddleware(async (c, next) => {
  const perfStart = performance.now();
  const childLogger = logger.child({
    requestId: c.get("requestId"),
  });
  c.set("logger", childLogger);
  await next();
  const responseTime = performance.now() - perfStart;
  childLogger.debug(
    {
      responseTime: responseTime.toFixed(2),
      req: {
        path: c.req.path,
        method: c.req.method,
        user: c.get("auth")?.user.id,
      },
      status: c.res.status,
    },
    "Request completed",
  );
});
