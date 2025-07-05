const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet")
const cors = require("cors")
// const mongooseSanitize = require("express-mongo-sanitize")
// const rateLimiter = require("express-rate-limit")
const connectToMongo = require("./db/connectToMongo");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const { createCustomError } = require("./errors");
const AdminRouter = require("./routes/admin");
const EmployeeRouter = require("./routes/employee");
const PurchaseRouter = require("./routes/salepurchase");
const MedicineRouter = require("./routes/medicine");
const InvoiceRouter = require("./routes/invoice");
const SaleRouter = require("./routes/sale");
const dashboardRouter = require("./routes/dashboard");


const app = express();

const PORT = 8000;

app.use(express.json());
app.use(morgan("short"));
app.use(helmet());
// app.use(mongooseSanitize());
app.use(cors({
  origin: '*'
}));


  app.get("/hello", (req,res,next) => {
     return next(createCustomError("oops", 404))
      // return res.status(200).json("Hello World")
  })


  app.use("/admin", AdminRouter) 
 app.use("/dashboard", dashboardRouter)
 app.use("/employee", EmployeeRouter) 
 app.use("/purchase", PurchaseRouter) 
 app.use("/medicine", MedicineRouter) 
 app.use("/invoice", InvoiceRouter) 
 app.use("/sale", SaleRouter) 


app.use(errorHandlerMiddleware)

const startServer = async () => {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer()