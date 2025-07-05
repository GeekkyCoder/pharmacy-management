const { createCustomError } = require("../../errors");
const asyncWrapper = require("../../middlewares/async-wrapper");
const Admin = require("../../models/admin");

const createAdmin = asyncWrapper(async (req, res, next) => {
  console.log("hello")
  const payload = req.body;

  const adminDup = await Admin.findOne({ A_ID: payload?.A_ID });
  if (adminDup) {
    return next(createCustomError("Duplicate Information", 404));
  }

  if (!payload?.A_ID || !payload?.A_Password || !payload?.A_Username) {
    return next(createCustomError("admin information needed", 404));
  }

  const { A_ID, A_Username, A_Password } = payload;

  const token = "admintoken122MaeWaziToken";

  const newAdmin = new Admin({
    A_ID,
    A_Password,
    A_Username,
    A_Token: token,
  });

  await newAdmin.save();

  return res
    .status(200)
    .json({
      user: newAdmin,
      msg: "Admin Created Successfully",
      token: newAdmin.A_Token,
    });
});

const adminLogin = asyncWrapper(async (req, res, next) => {
  const payload = req.body;

  if (!payload) {
    return next(createCustomError("provide admin information", 404));
  }

  if (!payload?.A_Username && !payload?.A_Password) {
    return next(createCustomError("provide username and password", 404));
  }

  const adminFound = await Admin.findOne({ A_Username: payload?.A_Username });

  if (!adminFound) {
    return next(createCustomError("admin does not exist", 404));
  }

  if (adminFound.A_Password !== payload?.A_Password) {
    return next(createCustomError("incorrect password", 404));
  }

  const user = {
    _id:adminFound?._id,
    userName: adminFound.A_Username,
    role: "admin",
  };

  return res.status(200).json({
    user,
    token: "1241421414",
  });
});

module.exports = {
  createAdmin,
  adminLogin,
};
