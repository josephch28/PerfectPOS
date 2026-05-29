import { oracleDb } from './src/infrastructure/database/oracle-connection';
import { OracleUserRepository } from './src/infrastructure/database/repositories/oracle/OracleUserRepository';

async function main() {
  try {
    const repo = new OracleUserRepository(oracleDb);
    const user = await repo.findByUsername('admin');
    console.log("Logged in user:", JSON.stringify(user, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await oracleDb.destroy();
  }
}

main();
