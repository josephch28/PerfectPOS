import { oracleDb } from './src/infrastructure/database/oracle-connection';

async function main() {
  try {
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "customerName" VARCHAR2(100)`);
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "customerLastName" VARCHAR2(100)`);
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "customerAddress" VARCHAR2(255)`);
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "customerPhone" VARCHAR2(20)`);
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "customerEmail" VARCHAR2(100)`);
    await oracleDb.raw(`ALTER TABLE "Sales" ADD "sellerName" VARCHAR2(100)`);
    console.log('Altered Sales successfully');
  } catch(e) {
    console.error(e);
  }
  await oracleDb.destroy();
}

main();
