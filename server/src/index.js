const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();

app.use(cors());

require("dotenv").config();
const PORT = process.env.PORT;
const server = http.createServer(app);
const router = require("./router");
app.use(express.json());

//socket
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT,
        methods: ["GET", "POST", "PATCH"],
    },
});
io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    socket.on("send_car", (data) => {
        socket.broadcast.emit("recieve_car", data);
    });
});

//database
mongoose
    .connect(process.env.DB)
    .then(async () => {
        console.log("DB connected!");
    })
    .catch((err) => console.log("DB failed to connect!"));

app.use("/car-service", router);
app.use("*", (req, res) => {
    res.redirect("/404");
});

server.listen(PORT, () => console.log(`app is running on port: ${PORT}`));
