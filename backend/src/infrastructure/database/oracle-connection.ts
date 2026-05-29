import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Asegurarse de que el .env esté cargado
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const oracleUrl = process.env.ORACLE_URL || 'oracle://PUNTOVENTA:PuntoVenta123!@localhost:1521/ORCLPDB1';

// Extraer credenciales de forma simple de la URL (formato oracle://user:pass@host:port/service)
const regex = /^oracle:\/\/(.+):(.+)@(.+):(\d+)\/(.+)$/;
const match = oracleUrl.match(regex);

let user = 'PUNTOVENTA';
let password = 'PuntoVenta123!';
let connectString = 'localhost:1521/ORCLPDB1';

if (match) {
  user = match[1];
  password = match[2];
  connectString = `${match[3]}:${match[4]}/${match[5]}`;
}

export const oracleDb = knex({
  client: 'oracledb',
  connection: {
    user,
    password,
    connectString,
  },
  pool: { min: 2, max: 10 },
  useNullAsDefault: true,
});
