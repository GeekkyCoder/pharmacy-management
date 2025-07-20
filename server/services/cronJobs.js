const cron = require('node-cron');
const { sendEmail, emailTemplates } = require('../utils');
const Admin = require('../models/user');
const Employee = require('../models/employee');
const Medicine = require('../models/medicine');
const SaleItem = require('../models/sale-items');
const moment = require('moment');

const generateDailyReport = async (adminId) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

  
    const todaySales = await SaleItem.find({
      admin: adminId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.Total_Price, 0);

    const lowStockMedicines = await Medicine.find({
      admin: adminId,
      Med_Qty: { $lte: 10 }
    }).select('Med_Name Med_Qty');

    
    const thirtyDaysFromNow = moment().add(30, 'days').toDate();
    const expiringMedicines = await Medicine.find({
      admin: adminId,
      Expiry_Date: { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).select('Med_Name Expiry_Date');

   
    const totalMedicines = await Medicine.countDocuments({ admin: adminId });

    
    const totalEmployees = await Employee.countDocuments({ admin: adminId });

    return {
      date: today,
      todaySales: todaySales.length,
      todayRevenue: todayRevenue,
      lowStockMedicines,
      expiringMedicines,
      totalMedicines,
      totalEmployees
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    return null;
  }
};


const sendDailyReports = async () => {
  try {
   
    const admins = await Admin.find({ role: 'admin' }).select('email userName _id');
    
    for (const admin of admins) {
      try {
      
        const reportData = await generateDailyReport(admin._id);
        
        if (!reportData) {
          console.error(`Failed to generate report for admin: ${admin.userName}`);
          continue;
        }

      
        const emailContent = emailTemplates.dailyReport(reportData, admin.userName);

        // Send email to admin
        if (admin.email) {
          const result = await sendEmail({
            to: admin.email,
            fromName: 'Pharmacy Management System',
            ...emailContent
          });

          if (result.success) {
            console.log(`✅ Daily report sent successfully to admin: ${admin.userName} (${admin.email})`);
          } else {
            console.error(`❌ Failed to send report to admin: ${admin.userName} - ${result.error}`);
          }
        }

      } catch (adminError) {
        console.error(`Error processing reports for admin ${admin.userName}:`, adminError);
      }
    }

    console.log('📧 Daily report email sending process completed');

  } catch (error) {
    console.error('Error in daily report cron job:', error);
  }
};


const initializeCronJobs = async () => {
  console.log('⏰ Initializing cron jobs...');  
  cron.schedule('0 22 * * *', () => {
    sendDailyReports();
  }, {
    scheduled: true,
    timezone: "Asia/Karachi" 
  });
};


module.exports = {
  initializeCronJobs
};
