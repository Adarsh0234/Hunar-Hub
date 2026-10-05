import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`HunarHub server running on port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Error: Port ${PORT} is already in use by another process.`);
    } else {
        console.error("Server error:", err);
    }
});