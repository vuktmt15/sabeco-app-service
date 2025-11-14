const express = require("express");
const { connectToDb } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    await connectToDb();
    res.send("Hello from Azure App Service!!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
