import type { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { session_id } = req.cookies;

    const transaction = await knex("transactions")
      .where("session_id", session_id)
      .select();

    return {
      total: transaction.length,
      data: transaction,
    };
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { session_id } = req.cookies;

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(req.params);

    const transaction = await knex("transactions")
      .where({
        id,
        session_id,
      })
      .first();

    return {
      data: transaction,
    };
  });

  app.get("/summary", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { session_id } = req.cookies;

    const summary = await knex("transactions")
      .where("session_id", session_id)
      .sum("amount", { as: "amount" })
      .first();

    return { data: summary };
  });

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(req.body);

    let session_id = req.cookies.session_id;

    if (!session_id) {
      session_id = crypto.randomUUID();

      res.cookie("session_id", session_id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id,
    });

    return res.status(201).send();
  });
}
