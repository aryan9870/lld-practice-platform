import express from "express";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "LLD Practice Platform API is running",
  });
});

app.use(routes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;