import {
  expect,
  test,
  beforeAll,
  afterAll,
  describe,
  it,
  beforeEach,
} from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("Should be able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("Should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies || [])
      .expect(200);

    expect(listTransactionsResponse.body.data).toEqual([
      expect.objectContaining({
        title: "new transaction",
        amount: 5000,
      }),
    ]);
  });

  it("Should be able to get a transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "new transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get(`/transactions`)
      .set("Cookie", cookies || [])
      .expect(200);

    const transactionId = listTransactionsResponse.body.data[0].id;

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies || [])
      .expect(200);

    expect(getTransactionsResponse.body.data).toEqual(
      expect.objectContaining({
        title: "new transaction",
        amount: 5000,
      })
    );
  });

  it("Should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "credit transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies || [])
      .send({
        title: "debit transaction",
        amount: 2000,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies || [])
      .expect(200);

    expect(summaryResponse.body.data).toEqual({ amount: 3000 });
  });
});
