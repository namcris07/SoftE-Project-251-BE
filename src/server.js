import express from "express";
import cors from "cors";
import { sequelize } from "./config/sequelize.js";

const app = express();

app.use(cors({
  origin: ["https://softe-project-client.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => res.send("✅ Backend is running on Railway!"));

// Connect DB
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    const port = process.env.PORT || 3000;
    app.listen(port, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connect error:", err);
  });
