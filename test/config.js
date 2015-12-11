export default {
  pg: {
    db: {
      client: 'postgresql',
      connection: {
        database: 'tabel_test',
        host: 'localhost',
        port: 5432,
        user: 'dev',
        password: 'dev'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: 'knex_migrations'
    },
    redis: {
      host: 'localhost',
      port: '6379',
      keyPrefix: 'repup.api.'
    }
  }
};
