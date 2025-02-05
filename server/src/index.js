const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");

//server config
const app = express();

app.use(cors());

require("dotenv").config();
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT;
const server = http.createServer(app);
const router = require("./router");

//database
mongoose
    .connect(process.env.DB)
    .then(async () => {
        console.log("connected to agro-2000");
    })
    .catch((err) => console.log("db connection failed!"));

app.use("/api/agro-2000", router);
app.use("*", (req, res) => {
    res.redirect("/404");
});

server.listen(PORT, () => console.log(`server is running on port: ${PORT}`));

process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log(`UNHANDLER REJECTION! Shutting down...`);
    server.close(() => {
        process.exit(1);
    });
});
