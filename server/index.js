const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet")
const cors = require("cors")
const cookieParser = require("cookie-parser");
const mongooseSanitize = require("express-mongo-sanitize")
const rateLimiter = require("express-rate-limit")
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
const { initializeCronJobs } = require("./services/cronJobs");


const app = express();

const PORT = process.env.PORT || 8000;

const isProduction = process.env.NODE_ENV === 'production';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.FRONTEND_URL, 
].filter(Boolean);

app.use(morgan(isProduction ? "combined" : "short"));

app.use(mongooseSanitize());

app.use(rateLimiter({
  windowMs: 2 * 60 * 1000, //2minutes
  max: 100,
  message: "Too many requests from this IP, please try again later."
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for cross-domain requests
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
}))

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Increase payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for production (important for Render)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get("/test-cookies", (req, res) => {
  res.status(200).json({
    message: "Cookie test endpoint",
    cookies: req.cookies,
    hasCookieParser: !!req.cookies,
    tokenExists: !!req.cookies.token,
    environment: process.env.NODE_ENV || 'development',
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
  });
});

app.get("/hello", (req,res,next) => {
   return next(createCustomError("oops", 404))
    // return res.status(200).json("Hello World")
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
    initializeCronJobs();
    app.listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer()