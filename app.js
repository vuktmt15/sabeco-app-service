const express = require("express");
const path = require("path");
const { connectToDb, getTables, getStudents, addStudent } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.get("/api/students", async (req, res) => {
    try {
        const connected = await connectToDb();
        if (!connected) {
            return res
                .status(500)
                .json({ error: "Database connection failed" });
        }

        const students = await getStudents();
        res.json(students);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/students", async (req, res) => {
    try {
        const { name, age, city } = req.body;

        if (!name || !age || !city) {
            return res
                .status(400)
                .json({ error: "Vui lòng điền đầy đủ thông tin" });
        }

        const connected = await connectToDb();
        if (!connected) {
            return res
                .status(500)
                .json({ error: "Database connection failed" });
        }

        const result = await addStudent(name, parseInt(age), city);
        if (result.success) {
            res.json({
                success: true,
                message: "Thêm học sinh thành công",
                id: result.id,
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
