import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions";

export const app = fastify();

app.register(fastifyCookie);

app.addHook("preHandler", async (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
});

app.register(transactionsRoutes, {
  prefix: "transactions",
});
