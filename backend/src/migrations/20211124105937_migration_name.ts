import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  console.log('!!!! up');
}


export async function down(knex: Knex): Promise<void> {
  console.log('!!!! down');
}

