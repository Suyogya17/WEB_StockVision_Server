const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const CustomerRouter = require("./routes/customer_route");
const ProductRouter = require("./routes/product_route");
const OrderRouter = require("./routes/order_route");
const AuthRouter = require("./routes/auth_route");
const path = require("path");

connectDB();

const app = express();
const corsOptions = {
    credentials: true,
    origin: ["http://localhost:5173"], 
};
app.use(cors(corsOptions)); 
app.use(express.json());

app.use("/api/customer", CustomerRouter);
app.use("/api/product", ProductRouter);
app.use("/api/order", OrderRouter);
app.use("/api/auth", AuthRouter);
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
