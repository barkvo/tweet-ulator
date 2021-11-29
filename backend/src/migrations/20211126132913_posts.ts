import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('posts', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('type', 255).notNullable();
    table.integer('value').notNullable();
    table.uuid('authorId').notNullable();
    table.uuid('parentPostId').nullable();
    table.string('operation', 255).nullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('posts');
}
