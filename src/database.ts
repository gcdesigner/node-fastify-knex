import { knex as setupNex, type Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
  seeds: {
    extension: "ts",
    directory: "./db/seeds",
  },
};

export const knex = setupNex(config);
