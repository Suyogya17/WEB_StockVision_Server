const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const path = require("path");

const CustomerRouter = require("./routes/customer_route");
const ProductRouter = require("./routes/product_route");
const OrderRouter = require("./routes/order_route");
const AuthRouter = require("./routes/auth_route");

connectDB();

const app = express();

// ✅ CORS config (correct origin)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ CORS for static image access (must be before security middleware)
app.use(
  "/uploads",
  cors({ origin: "http://localhost:5173", credentials: true }),
  (req, res, next) => {
    // Handle preflight requests for CORS
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", "http://localhost:5173");
      res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
      return res.sendStatus(200);
    }
    next();
  },
  express.static(path.join(__dirname, "public", "uploads"))
);

// ✅ Security middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ✅ Routes
app.use("/api/customer", CustomerRouter);
app.use("/api/product", ProductRouter);
app.use("/api/order", OrderRouter);
app.use("/api/auth", AuthRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
