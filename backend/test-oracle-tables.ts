import { oracleDb } from './src/infrastructure/database/oracle-connection';

async function main() {
  console.log('Testing connection to Oracle...');
  try {
    const result = await oracleDb.raw('SELECT table_name FROM all_tables WHERE owner = \'PUNTOVENTA\'');
    console.log('Tables found:', result.map((r: any) => r.TABLE_NAME || r.table_name));
  } catch (error: any) {
    console.error('Connection failed:', error.message);
  } finally {
    await oracleDb.destroy();
  }
}
main();
