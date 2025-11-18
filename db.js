const sql = require("mssql");

const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
    },
    connectionTimeout: 60000,
    requestTimeout: 60000,
};

let poolPromise;

async function getConnection() {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(config);
        }
        const pool = await poolPromise;
        console.log("Database connection established");
        return pool;
    } catch (err) {
        console.error("Database connection failed:", err);
        poolPromise = null; // Reset on failure
        throw err;
    }
}

async function connectToDb() {
    try {
        await getConnection();
        return true;
    } catch (err) {
        console.error("Database connection test failed:", err.message);
        return false;
    }
}

async function getTables() {
    try {
        console.log("Getting tables from database...");
        const pool = await getConnection();
        const result = await pool
            .request()
            .query("SELECT name FROM sys.tables ORDER BY name");
        console.log(`Found ${result.recordset.length} tables`);
        return result.recordset;
    } catch (err) {
        console.error("Error getting tables:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
}

async function getStudents() {
    try {
        console.log("Getting students from database...");
        const pool = await getConnection();

        // First check if table exists
        const tableCheck = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Students'
        `);

        if (tableCheck.recordset[0].count === 0) {
            console.log("Students table does not exist, creating it...");
            await pool.request().query(`
                CREATE TABLE dbo.Students (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(100),
                    Age INT,
                    City NVARCHAR(100)
                )
            `);
            console.log("Students table created successfully");
            return [];
        }

        const result = await pool
            .request()
            .query("SELECT Id, Name, Age, City FROM dbo.Students ORDER BY Id");
        console.log(`Found ${result.recordset.length} students`);
        return result.recordset;
    } catch (err) {
        console.error("Error getting students:", err.message);
        throw new Error(`Database query failed: ${err.message}`);
    }
}

async function addStudent(name, age, city) {
    try {
        console.log(`Adding student: ${name}, ${age}, ${city}`);
        const pool = await getConnection();
        const request = pool.request();
        request.input("name", sql.NVarChar(100), name);
        request.input("age", sql.Int, age);
        request.input("city", sql.NVarChar(100), city);

        const result = await request.query(
            "INSERT INTO dbo.Students (Name, Age, City) VALUES (@name, @age, @city); SELECT SCOPE_IDENTITY() as Id"
        );
        console.log(
            `Student added successfully with ID: ${result.recordset[0].Id}`
        );
        return { success: true, id: result.recordset[0].Id };
    } catch (err) {
        console.error("Error adding student:", err.message);
        return { success: false, error: err.message };
    }
}

// Graceful shutdown
process.on("SIGINT", async () => {
    try {
        await sql.close();
        console.log("Database connection closed.");
    } catch (err) {
        console.error("Error closing database connection:", err);
    }
    process.exit(0);
});

module.exports = { connectToDb, getTables, getStudents, addStudent };
