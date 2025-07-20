const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet")
const cors = require("cors")
const cookieParser = require("cookie-parser");
// const mongooseSanitize = require("express-mongo-sanitize")
// const rateLimiter = require("express-rate-limit")
const connectToMongo = require("./db/connectToMongo");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const { createCustomError } = require("./errors");
const UserRouter = require("./routes/user");
const PurchaseRouter = require("./routes/salepurchase");
const MedicineRouter = require("./routes/medicine");
const InvoiceRouter = require("./routes/invoice");
const SaleRouter = require("./routes/sale");
const dashboardRouter = require("./routes/dashboard");
const EmployeeRouter = require("./routes/employee");
const DiscountRouter = require("./routes/discount");
const PharmacyInfoRouter = require("./routes/pharmacy-info");
const { triggerDailyReportsNow, initializeCronJobs } = require("./services/cronJobs");


const app = express();

const PORT = 8000;



app.use(morgan("short"));
app.use(helmet());
// app.use(mongooseSanitize());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}))

app.use(cookieParser());
app.use(express.json());

  app.get("/hello", (req,res,next) => {
     return next(createCustomError("oops", 404))
      // return res.status(200).json("Hello World")
  })

  // Test route to manually trigger daily reports (for testing)
  app.get("/test-daily-reports", async (req, res) => {
    try {
      const { triggerDailyReportsNow } = require("./services/cronJobs");
      await triggerDailyReportsNow();
      res.status(200).json({ 
        success: true, 
        message: "Daily reports triggered successfully. Check console for details." 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error triggering daily reports", 
        error: error.message 
      });
    }
  })


 app.use("/user", UserRouter) 
 app.use("/employee", EmployeeRouter); 
 app.use("/dashboard", dashboardRouter)
 app.use("/purchase", PurchaseRouter) 
 app.use("/medicine", MedicineRouter) 
 app.use("/invoice", InvoiceRouter) 
 app.use("/sale", SaleRouter) 
 app.use("/discount", DiscountRouter);
 app.use("/pharmacy-info", PharmacyInfoRouter);


app.use(errorHandlerMiddleware)

const startServer = async () => {
  try {
    await connectToMongo();
    
    // Initialize cron jobs after database connection
    // initializeCronJobs();
    // triggerDailyReportsNow(); // Trigger daily reports immediately for testing

    app.listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer()