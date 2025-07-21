const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const mongoose = require('mongoose');
const helmet = require("helmet")
const cors = require("cors")
const cookieParser = require("cookie-parser");
// const mongooseSanitize = require("express-mongo-sanitize")
const rateLimiter = require("express-rate-limit")
const connectToMongo = require("./db/connectToMongo");
const errorHandlerMiddleware = require("./middlewares/error-handler");
// const { createCustomError } = require("./errors");
const UserRouter = require("./routes/user");
const PurchaseRouter = require("./routes/salepurchase");
const MedicineRouter = require("./routes/medicine");
const InvoiceRouter = require("./routes/invoice");
const SaleRouter = require("./routes/sale");
const dashboardRouter = require("./routes/dashboard");
const EmployeeRouter = require("./routes/employee");
const DiscountRouter = require("./routes/discount");
const PharmacyInfoRouter = require("./routes/pharmacy-info");
// const { initializeCronJobs } = require("./services/cronJobs");

console.log('Starting Pharmacy Management Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL configured:', !!process.env.DB_CONNECT);

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

//app.use(mongooseSanitize());

// app.use(rateLimiter({
//   windowMs: 2 * 60 * 1000, //2minutes
//   max: 100,
//   message: "Too many requests from this IP, please try again later."
// }));

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

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Pharmacy Management API",
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({ 
      status: "OK", 
      message: "Server is running",
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: "ERROR",
      message: "Server health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
    console.log('Database connected successfully');
    // initializeCronJobs();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check available at: /health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer()