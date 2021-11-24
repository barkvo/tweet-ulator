import { Knex } from 'knex';

export const getConfig = (): {
  database: Knex.Config;
} => {
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
  } = process.env;
  return {
    database: {
      client: 'pg',
      connection: {
        host : POSTGRES_HOST,
        port : parseInt(POSTGRES_PORT!),
        user : POSTGRES_USER,
        password : POSTGRES_PASSWORD,
        database : POSTGRES_DB
      },
      migrations: {
        directory: '../migrations'
      }
    },
  };
};

export default getConfig().database;
