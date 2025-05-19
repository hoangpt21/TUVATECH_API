import { createPool } from 'mysql2';
import { env } from './environment';

const connection = createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    port: env.DB_PORT,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
  }).promise();

export default connection