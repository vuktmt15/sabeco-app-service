const sql = require("mssql");

const config = {
    user: "CloudSAe0a9edb9",
    password: "Abc@123456789123456789",
    server: "sqlmi-east.de303115d19d.database.windows.net", // Thay bằng tên server của bạn
    database: "sabeco-lab-db", // Thay bằng tên database của bạn
    options: {
        encrypt: true, // Bắt buộc với Azure
        trustServerCertificate: false,
    },
};

async function connectToDb() {
    try {
        await sql.connect(config);
        console.log("Connected to Azure SQL Managed Instance");
        return true;
    } catch (err) {
        console.error("Database connection failed:", err);
        return false;
    }
}

async function getTables() {
    try {
        const result = await sql.query(
            "SELECT name FROM sys.tables ORDER BY name"
        );
        return result.recordset;
    } catch (err) {
        console.error("Error getting tables:", err);
        return [];
    }
}

module.exports = { connectToDb, getTables };
