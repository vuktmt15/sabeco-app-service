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

async function getStudents() {
    try {
        const result = await sql.query(
            "SELECT Id, Name, Age, City FROM dbo.Students ORDER BY Id"
        );
        return result.recordset;
    } catch (err) {
        console.error("Error getting students:", err);
        return [];
    }
}

async function addStudent(name, age, city) {
    try {
        const request = new sql.Request();
        request.input("name", sql.NVarChar(100), name);
        request.input("age", sql.Int, age);
        request.input("city", sql.NVarChar(100), city);

        const result = await request.query(
            "INSERT INTO dbo.Students (Name, Age, City) VALUES (@name, @age, @city); SELECT SCOPE_IDENTITY() as Id"
        );
        return { success: true, id: result.recordset[0].Id };
    } catch (err) {
        console.error("Error adding student:", err);
        return { success: false, error: err.message };
    }
}

module.exports = { connectToDb, getTables, getStudents, addStudent };
