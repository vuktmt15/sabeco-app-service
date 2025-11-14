const express = require("express");
const path = require("path");
const { connectToDb, getTables } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from root directory
app.use(express.static("./"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/tables", async (req, res) => {
    try {
        const connected = await connectToDb();
        if (!connected) {
            return res
                .status(500)
                .json({ error: "Database connection failed" });
        }

        const tables = await getTables();
        res.json(tables);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
