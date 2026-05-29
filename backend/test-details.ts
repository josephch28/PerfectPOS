import { oracleDb } from './src/infrastructure/database/oracle-connection';

async function main() {
  try {
    const data = await oracleDb('Sales').orderBy('id', 'desc').limit(2);
    console.log("Sales IDs:", data.map(r => r.id));
    
    const saleIds = data.map(r => r.id);
    const allDetails = await oracleDb('SaleDetails').whereIn('saleId', saleIds);
    console.log("Details fetched length:", allDetails.length);
    console.log("Sample detail:", allDetails[0]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await oracleDb.destroy();
  }
}

main();
