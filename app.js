const express = require("express");
const connectDB = require("./config/db");
const CustomerRouter = require("./routes/customer_route");
const ProductRouter = require("./routes/product_route");
const OrderRouter = require("./routes/order_route");
const AuthRouter = require("./routes/auth_route");

connectDB();

const app = express();
app.use(express.json());

app.use("/api/customer", CustomerRouter);
app.use("/api/product", ProductRouter);
app.use("/api/order", OrderRouter);
app.use("/api/auth", AuthRouter);

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
