import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout";
import "./App.css";
import ProtectedRoute from "./components/protected-route";
import { useSelector } from "react-redux";

import RestockPurchase from "./pages/restock-purchase"
import BarcodeScanner from "./pages/barcode";
import MedicineInventory from "./pages/inventory";
// Lazy loaded pages
const Home = React.lazy(() => import("./pages/home"));
const SaleReports = React.lazy(() => import("./pages/sale-reports"));
// const MedicineInventory = React.lazy(() => import("./pages/inventory"));
const AddEmployee = React.lazy(() => import("./pages/add-employess"));
const ManageEmployees = React.lazy(() => import("./pages/manage-employees"));
const UpdateEmployee = React.lazy(() => import("./pages/update-employee"));
const AddSale = React.lazy(() => import("./pages/add-sale"));
const AddSupplierPurchase = React.lazy(() =>
  import("./pages/add-supplier-purchase")
);
const LoginPage = React.lazy(() => import("./pages/login"));
const ViewSuppliers = React.lazy(() => import("./pages/view-suppliers"));
const ViewInvoices = React.lazy(() => import("./pages/view-invoices"));
const ViewSales = React.lazy(() => import("./pages/view-sales"));
const UnAuthorized = React.lazy(() => import("./pages/unauthorized"));
const Settings = React.lazy(() => import("./pages/settings"));
const SignupPage = React.lazy(() => import("./pages/signup"));

const App = () => {
  const user = useSelector((state) => state.auth.user);
 
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route  path="/unauthorized" element={<UnAuthorized/>}/>

          {/* All other routes go under protected route */}
          <Route
            path="/"
            element={
              <ProtectedRoute isDashaboardAndEmployee={user?.role === "employee"} user={user} allowedRoles={["admin","employee"]}>
                <DashboardLayout user={user}/>
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "employee"]}
                >
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-report"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin"]}
                >
                  <SaleReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin"]}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-inventory"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "employee"]}
                >
                  <MedicineInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-employee"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AddEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="manage-employees"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <ManageEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="signup-admin"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <SignupPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="add-sale"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["employee"]}
                >
                  <AddSale />
                </ProtectedRoute>
              }
            />

            <Route
              path="add-supplier"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["employee"]}
                >
                  <AddSupplierPurchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="view-supplier"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "employee"]}
                >
                  <ViewSuppliers />
                </ProtectedRoute>
              }
            />

            <Route
              path="view-sold-products"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "employee"]}
                >
                  <ViewSales />
                </ProtectedRoute>
              }
            />

            <Route
              path="view-sales-invoices"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["admin", "employee"]}
                >
                  <ViewInvoices />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="update-employee/:employeeId"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <UpdateEmployee />
              </ProtectedRoute>
            }
          />

          <Route
            path="sale/restock"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin","employee"]}>
                <RestockPurchase />
              </ProtectedRoute>
            }
          />

         <Route
            path="barcode/scan"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin","employee"]}>
                <BarcodeScanner />
              </ProtectedRoute>
            }
          />


        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
