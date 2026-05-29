import { oracleDb } from './src/infrastructure/database/oracle-connection';
import { OracleSaleRepository } from './src/infrastructure/database/repositories/oracle/OracleSaleRepository';

async function main() {
  try {
    const repo = new OracleSaleRepository(oracleDb);
    const result = await repo.findAll(1, 1);
    console.log("findAll total:", result.total);
    console.log("findAll details length:", result.data[0]?.details?.length);
    console.log("First detail:", result.data[0]?.details[0]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await oracleDb.destroy();
  }
}

main();
