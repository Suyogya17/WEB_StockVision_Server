const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const CustomerRouter = require("./routes/customer_route");
const ProductRouter = require("./routes/product_route");
const OrderRouter = require("./routes/order_route");
const AuthRouter = require("./routes/auth_route");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
connectDB();

const app = express();
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5174"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/api/customer", CustomerRouter);
app.use("/api/product", ProductRouter);
app.use("/api/order", OrderRouter);
app.use("/api/auth", AuthRouter);
app.use(
  "/uploads",
  cors(corsOptions),
  express.static(path.join(__dirname, "public", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    },
  })
);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
