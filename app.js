const express = require ("express")
const app = express();
const connectDB =require("./config/db")
const CustomerRouter= require ("./routes/customer_route")
connectDB();

app.use(express.json()
);

app.use("/api/customer", CustomerRouter);

const port =3000;
app.listen (port,() => {
    console.log (`server running at http://localhost:${port}`);
})


