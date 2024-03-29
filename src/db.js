import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.AZURE_POSTGRESQL_USER,
    host: process.env.AZURE_POSTGRESQL_HOST,
    database: process.env.AZURE_POSTGRESQL_DATABASE,
    password: process.env.AZURE_POSTGRESQL_PASSWORD,
    port: process.env.AZURE_POSTGRESQL_PORT,
    ssl: process.env.AZURE_POSTGRESQL_SSL === "true"
});

export default pool;
