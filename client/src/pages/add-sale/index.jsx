import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Steps,
  Card,
  message,
  Table,
  Space,
  Statistic,
  Tag,
  Alert,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import generateCustomerId from "../../utils/generateCustomerID";
import { useSelector } from "react-redux";
import { createNewSale, getAllMedicines, calculateSaleDiscount, getPharmacyInfo } from "./apiCalls";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import generateInvoiceId from "../../utils/generateInvoiceId";
import useModal from "../../components/modal/useModal";
import Modal from "../../components/modal";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

// Default Pharmacy Details (fallback)
const defaultPharmacyInfo = {
  pharmacyName: "Al Shifa Pharmacy",
  pharmacyLogo: "https://static.vecteezy.com/system/resources/previews/023/432/110/non_2x/low-poly-and-creative-medical-pharmacy-logo-design-design-concept-free-vector.jpg",
  address: {
    street: "Al Shifa Diagnostic and clinic center near Edigah",
    city: "Kashmore",
    state: "Sindh",
    country: "Pakistan"
  },
  contactInfo: {
    phone: "(0314) 7320-407",
    email: "info@alshifa.com"
  },
  licenseNumber: "PH-2024-001234",
  description: "Medical Store & Pharmacy"
};

const steps = [
  {
    title: "Sale Information",
    content: "First-content",
  },
  {
    title: "Checkout & Discounts", 
    content: "Second-content",
  },
  {
    title: "Review & Print",
    content: "Third-content",
  },
];

const validationSchema = [
  // First step validation
  Yup.object({
    C_Name: Yup.string()
      .required("C Name is required")
      .matches(/^[A-Za-z ]+$/, "C_Name can contain only letters"),
    medicines: Yup.array().of(
      Yup.object().shape({
        Med_Name: Yup.string()
          .required("Medicine is required")
          .test(
            "inventory-zero-check",
            "Cannot add this medicine due to low stock",
            function (value) {
              const availableQty = this.parent?.Availabe_Med_Qty;
              return !(
                availableQty !== undefined && parseInt(availableQty) === 0
              );
            }
          ),
        Sale_Qty: Yup.number()
          .required("Quantity is required")
          .min(1, "quantity minimum should be 1")
          .positive()
          .test(
            "quantity",
            "quantity should not be greater than available quantity",
            function (value) {
              const parent = this.parent;
              if (value && parent?.Availabe_Med_Qty) {
                return value <= parent.Availabe_Med_Qty;
              }
              return false;
            }
          ),
        Availabe_Med_Qty: Yup.number().required("Quantity is required"),
      })
    ),
  }),
  // Second step (checkout) validation
  Yup.object({
    medicines: Yup.array().min(1, "At least one medicine is required"),
  }),
  // Third step (review) validation
  Yup.object({}), // No validation needed for review step
];

const AddSale = (props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [medicinesData, setMedicinesData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountData, setDiscountData] = useState(null);
  const [isCalculatingDiscount, setIsCalculatingDiscount] = useState(false);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [invoiceData, setInvoiceData] = useState({});
  const [printBtnLoading, setPrintBtnLoading] = useState(false);
  const [pharmacyInfo, setPharmacyInfo] = useState(defaultPharmacyInfo);
  const invoiceRef = useRef(null);
  const { modalOpen, toggleModal } = useModal();
  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate()

  const calculateTotalAmount = useCallback(
    (values) => {
      let total = 0;
      values.medicines.forEach((item) => {
        const med = medicinesData.find((m) => m._id === item.Med_Name);
        const price = med?.Med_Price || 0;
        total += price * (item.Sale_Qty || 0);
      });
      setTotalAmount(total);
      setOriginalTotal(total);
      return total; // Return total for immediate use
    },
    [medicinesData]
  );

  // Calculate discount for sale items
  const calculateSaleDiscounts = async (values) => {
    setIsCalculatingDiscount(true);
    
    // Transform sale items to the format expected by the discount API
    const items = values.medicines.map(item => {
      const med = medicinesData.find((m) => m._id === item.Med_Name);
      return {
        medicineId: item.Med_Name,
        quantity: item.Sale_Qty || 1
      };
    }).filter(item => item.medicineId); // Filter out invalid items

    if (items.length === 0) {
      setIsCalculatingDiscount(false);
      return;
    }

    await calculateSaleDiscount(
      items,
      (data) => {
        setDiscountData(data);
        // Update total amount with discounted price
        setTotalAmount(data.summary.totalFinalAmount);
        setIsCalculatingDiscount(false);
      },
      (error) => {
        props.error(error);
        setIsCalculatingDiscount(false);
        // Set basic calculation without discounts
        const originalTotal = calculateTotalAmount(values);
        const basicData = {
          items: values.medicines.map(item => {
            const med = medicinesData.find((m) => m._id === item.Med_Name);
            const originalAmount = (med?.Med_Price || 0) * (item.Sale_Qty || 0);
            return {
              medicine: {
                id: med?._id,
                name: med?.Med_Name,
                price: med?.Med_Price || 0
              },
              quantity: item.Sale_Qty || 0,
              originalAmount,
              discountApplied: null,
              finalAmount: originalAmount
            };
          }),
          summary: {
            totalOriginalAmount: originalTotal,
            totalDiscountAmount: 0,
            totalFinalAmount: originalTotal,
            totalSavings: 0
          }
        };
        setDiscountData(basicData);
      }
    );
  };

  const handlePrint = async (values, resetForm) => {
    const printContents = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=400");
    setPrintBtnLoading(true);
    props.setLoading(true);

    // Use discounted total if available, otherwise calculate original total
    const finalTotal = discountData?.summary?.totalFinalAmount || calculateTotalAmount(values);
    const savings = discountData?.summary?.totalSavings || 0;

    const body = {
      invoiceId: generateInvoiceId(),
      customerId: generateCustomerId(),
      customerName: values.C_Name,
      items: values.medicines.map((item, index) => {
        const med = medicinesData.find((m) => m._id === item.Med_Name);
        const discountItem = discountData?.items?.[index];
        return {
          name: med?.Med_Name || "",
          price: med?.Med_Price || 0,
          quantity: item.Sale_Qty,
          originalAmount: (med?.Med_Price || 0) * item.Sale_Qty,
          finalAmount: discountItem?.finalAmount || (med?.Med_Price || 0) * item.Sale_Qty,
          discount: discountItem?.discountApplied || null,
        };
      }),
      originalAmount: originalTotal,
      totalAmount: finalTotal,
      totalSavings: savings,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss A"),
      pharmacyInfo,
    };

    const reqBody = {
      invoiceId: body?.invoiceId,
      C_Name: body?.customerName,
      C_ID: body?.customerId,
      employeeId: user?._id,
      totalPrice: finalTotal,
      originalPrice: originalTotal,
      totalSavings: savings,
      discountInfo: discountData?.summary || null,
      medicines: body.items.map((item) => {
        const med = medicinesData.find((m) => m.Med_Name === item.name);
        return {
          Med_ID: med?._id,
          Sale_Qty: item?.quantity,
          finalPrice: item.finalAmount,
        };
      }),
      No_Of_Items: body.items.length,
      items: body.items.map((item) => {
        const med = medicinesData.find((m) => m.Med_Name === item.name);
        return {
          med: med?._id,
          Med_Name: item.name,
          Med_Qty: item.quantity,
          Med_Price: item.price,
          finalPrice: item.finalAmount,
          discount: item.discount,
        };
      }),
    };

    try {
      const response = await createNewSale(
        reqBody,
        onSuccessSubmit,
        onFailureSubmit
      );

      if (response) {
        toggleModal(false);
        setTotalAmount(0);
        resetForm();

        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${body.invoiceId}</title>
              <style>
                @page {
                  margin: 0;
                  size: 80mm 297mm;
                }
              
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
              
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 11px;
                  line-height: 1.4;
                  color: #000;
                  background: white;
                  width: 80mm;
                  margin: 0 auto;
                  padding: 8px;
                }
              
                .receipt-container {
                  width: 100%;
                  max-width: 76mm;
                  margin: 0 auto;
                }
              
                .header {
                  text-align: center;
                  margin-bottom: 12px;
                  padding-bottom: 8px;
                  border-bottom: 2px solid #000;
                }
              
                .logo {
                  max-width: 60px;
                  height: auto;
                  margin: 0 auto 8px;
                  display: block;
                  border-radius: 50%;
                }
              
                .pharmacy-name {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 4px 0;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
              
                .pharmacy-tagline {
                  font-size: 10px;
                  font-style: italic;
                  margin: 2px 0;
                  color: #555;
                }
              
                .pharmacy-details {
                  font-size: 9px;
                  margin: 2px 0;
                  line-height: 1.2;
                }
              
                .license-info {
                  font-size: 8px;
                  margin-top: 4px;
                  color: #666;
                }
              
                .invoice-header {
                  text-align: center;
                  margin: 10px 0;
                  padding: 6px 0;
                  background: #f0f0f0;
                  border: 1px solid #ccc;
                }
              
                .invoice-title {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 4px;
                }
              
                .customer-info {
                  margin: 10px 0;
                  padding: 6px;
                  background: #f9f9f9;
                  border: 1px dashed #999;
                }
              
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 2px 0;
                  font-size: 10px;
                }
              
                .divider {
                  border-top: 1px dashed #000;
                  margin: 8px 0;
                }
              
                .solid-divider {
                  border-top: 2px solid #000;
                  margin: 8px 0;
                }
              
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 8px 0;
                }
              
                .items-table th {
                  background: #e0e0e0;
                  padding: 4px 2px;
                  font-size: 9px;
                  font-weight: bold;
                  text-align: left;
                  border-bottom: 1px solid #999;
                }
              
                .items-table td {
                  padding: 3px 2px;
                  font-size: 9px;
                  border-bottom: 1px dotted #ccc;
                  vertical-align: top;
                }
              
                .item-name {
                  font-weight: bold;
                  max-width: 30mm;
                  word-wrap: break-word;
                }
              
                .text-right {
                  text-align: right;
                }
              
                .text-center {
                  text-align: center;
                }
              
                .discount-info {
                  background: #e8f5e8;
                  padding: 4px;
                  margin: 4px 0;
                  border: 1px dashed #4CAF50;
                  font-size: 9px;
                }
              
                .totals-section {
                  margin: 10px 0;
                  padding: 8px;
                  background: #f5f5f5;
                  border: 1px solid #ddd;
                }
              
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                  font-size: 10px;
                }
              
                .final-total {
                  font-size: 14px;
                  font-weight: bold;
                  padding: 4px 0;
                  border-top: 2px solid #000;
                  margin-top: 4px;
                }
              
                .savings-highlight {
                  color: #4CAF50;
                  font-weight: bold;
                }
              
                .footer {
                  text-align: center;
                  margin-top: 12px;
                  padding-top: 8px;
                  border-top: 2px solid #000;
                  font-size: 8px;
                  line-height: 1.3;
                }
              
                .thank-you {
                  font-size: 10px;
                  font-weight: bold;
                  margin: 4px 0;
                }
              
                .return-policy {
                  font-size: 7px;
                  color: #666;
                  margin: 2px 0;
                }
              
                .qr-placeholder {
                  width: 30px;
                  height: 30px;
                  background: #ddd;
                  margin: 8px auto;
                  border: 1px solid #999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 6px;
                }
              
                @media print {
                  body {
                    margin: 0;
                    padding: 8px;
                  }
                  
                  .receipt-container {
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <!-- Header Section -->
                <div class="header">
                  <img src="${body.pharmacyInfo.pharmacyLogo || defaultPharmacyInfo.pharmacyLogo}" class="logo" alt="Logo">
                  <div class="pharmacy-name">${body.pharmacyInfo.pharmacyName || defaultPharmacyInfo.pharmacyName}</div>
                  <div class="pharmacy-details">
                    ${body.pharmacyInfo.address?.street || defaultPharmacyInfo.address.street}<br>
                    ${body.pharmacyInfo.address?.city || defaultPharmacyInfo.address.city}, ${body.pharmacyInfo.address?.state || defaultPharmacyInfo.address.state}<br>
                    Tel: ${body.pharmacyInfo.contactInfo?.phone || defaultPharmacyInfo.contactInfo.phone}<br>
                    ${body.pharmacyInfo.contactInfo?.email ? `Email: ${body.pharmacyInfo.contactInfo.email}` : `Email: ${defaultPharmacyInfo.contactInfo.email}`}
                  </div>
                  <div class="license-info">
                    License: ${body.pharmacyInfo.licenseNumber || defaultPharmacyInfo.licenseNumber}
                  </div>
                </div>

                <!-- Invoice Header -->
                <div class="invoice-header">
                  <div class="invoice-title">SALES INVOICE</div>
                  <div>Invoice #: ${body.invoiceId}</div>
                </div>

                <!-- Customer Information -->
                <div class="customer-info">
                  <div class="info-row">
                    <span><strong>Customer:</strong></span>
                    <span>${body.customerName}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Customer ID:</strong></span>
                    <span>${body.customerId}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Date:</strong></span>
                    <span>${body.date}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Time:</strong></span>
                    <span>${body.time}</span>
                  </div>
                  <div class="info-row">
                    <span><strong>Served by:</strong></span>
                    <span>${user?.name || 'Staff'}</span>
                  </div>
                </div>

                <div class="divider"></div>

                <!-- Items Table -->
                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 40%;">Item</th>
                      <th style="width: 15%;" class="text-center">Qty</th>
                      <th style="width: 20%;" class="text-right">Price</th>
                      <th style="width: 25%;" class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${body.items
                      .map((item, index) => {
                        const hasDiscount = item.discount && item.finalAmount < item.originalAmount;
                        return `
                          <tr>
                            <td class="item-name">${item.name}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">PKR ${item.price.toFixed(2)}</td>
                            <td class="text-right">
                              ${hasDiscount ? 
                                `<div style="text-decoration: line-through; color: #999; font-size: 8px;">PKR ${item.originalAmount.toFixed(2)}</div>
                                 <div style="color: #4CAF50; font-weight: bold;">PKR ${item.finalAmount.toFixed(2)}</div>` :
                                `PKR ${item.finalAmount.toFixed(2)}`
                              }
                            </td>
                          </tr>
                          ${hasDiscount ? 
                            `<tr>
                               <td colspan="4" style="font-size: 8px; color: #4CAF50; font-style: italic;">
                                 ↳ ${item.discount.name} (-PKR ${item.discount.discountAmount?.toFixed(2)})
                               </td>
                             </tr>` : ''
                          }
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>

                <div class="divider"></div>

                <!-- Discount Information -->
                ${body.totalSavings > 0 ? `
                  <div class="discount-info">
                    <div style="font-weight: bold; margin-bottom: 2px;">💰 Savings Applied!</div>
                    <div>You saved PKR ${body.totalSavings.toFixed(2)} on this purchase</div>
                  </div>
                ` : ''}

                <!-- Totals Section -->
                <div class="totals-section">
                  <div class="total-row">
                    <span>Total Items:</span>
                    <span><strong>${body.items.length}</strong></span>
                  </div>
                  ${body.totalSavings > 0 ? `
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>PKR ${body.originalAmount.toFixed(2)}</span>
                    </div>
                    <div class="total-row savings-highlight">
                      <span>Total Savings:</span>
                      <span>-PKR ${body.totalSavings.toFixed(2)}</span>
                    </div>
                  ` : ''}
                  <div class="total-row final-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>PKR ${body.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div class="solid-divider"></div>

                <!-- Footer -->
                <div class="footer">
                  <div class="thank-you">Thank You for Your Purchase!</div>
                  <div>Your health is our priority</div>
                  
                  <div class="qr-placeholder">QR</div>
                  
                  <div class="return-policy">
                    • Medicine returns accepted within 7 days with receipt<br>
                    • Keep this receipt for warranty claims<br>
                    • For queries: ${body.pharmacyInfo.contactInfo?.phone || defaultPharmacyInfo.contactInfo.phone}
                  </div>
                  
                  <div style="margin-top: 8px; font-weight: bold;">
                    Generated by ${body?.pharmacyInfo?.pharmacyName}}
                  </div>
                  
                  <div style="margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">
                    *** End of Receipt ***
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);

        printWindow.document.close();

        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            resetForm();
            setCurrentStep(0);
            navigate(-1)
          };
        };
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPrintBtnLoading(false);
      props.setLoading(false);
    }
  };

  const getMedicines = useCallback(async () => {
    props.setLoading(true);
    try {
      const response = await getAllMedicines(onSuccess, onFailure);
      if (!response) {
        console.error("Could not fetch medicines");
      }
    } catch (err) {
      console.error("Something Went Wrong");
    } finally {
      props.setLoading(false);
    }
  }, []);

  const getPharmacyInformation = useCallback(async () => {
    try {
      await getPharmacyInfo(
        (data) => {
          setPharmacyInfo(data);
        },
        (error) => {
          console.warn("Could not fetch pharmacy info, using default:", error);
          // Keep default pharmacy info if fetch fails
        }
      );
    } catch (err) {
      console.warn("Error fetching pharmacy info:", err);
    }
  }, []);

  const onSuccess = useCallback((data) => {
    setMedicinesData(data);
  }, []);

  const onFailure = useCallback((message) => {
    props.error(message);
  }, []);

  const onSuccessSubmit = useCallback((options) => {
    props.success(options.message);
  }, []);

  const onFailureSubmit = useCallback((message) => {
    props.success(message);
  }, []);

  useEffect(() => {
    getMedicines();
    getPharmacyInformation();
  }, [getMedicines, getPharmacyInformation]);

  const medicinesOptions = useMemo(
    () =>
      medicinesData?.map((med) => ({
        label: med?.Med_Name,
        value: med?._id,
        quantityAvailable: med?.Med_Qty,
      })),
    [medicinesData]
  );

  const handleSaleSubmit = useCallback((body) => {
    toggleModal(true);
    setInvoiceData(body);
  }, []);

  const next = (formikProps) => {
    const { validateForm, setTouched, values, errors } = formikProps;

    const touchedFields = {
      C_Name: true,
      medicines: values.medicines.map(() => ({
        Med_Name: true,
        Sale_Qty: true,
        Available_Med_Qty: true,
      })),
    };

    setTouched(touchedFields);

    validateForm().then((formErrors) => {
      if (Object.keys(formErrors).length === 0) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // If moving to checkout step (step 1), calculate discounts
        if (nextStep === 1) {
          calculateSaleDiscounts(values);
        }
      } else {
        props.error("Please fill the fields...");
      }
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = (step, formikProps) => {
    const { values, errors, touched, setFieldValue } = formikProps;

    switch (step) {
      case 0:
        return (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Customer Name"
                  validateStatus={
                    touched.C_Name && errors.C_Name ? "error" : ""
                  }
                  help={touched.C_Name && errors.C_Name}
                >
                  <Input
                    value={values.C_Name}
                    onChange={(e) => setFieldValue("C_Name", e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Medicines</Divider>

            <FieldArray name="medicines">
              {({ push, remove }) => (
                <>
                  {values.medicines.map((item, index) => {
                    const selectedMed = medicinesData.find(
                      (m) => m._id === item.Med_Name
                    );
                    const price = selectedMed?.Med_Price || 0;
                    const lineTotal = price * (item.Sale_Qty || 0);

                    calculateTotalAmount(values);

                    return (
                      <Card
                        key={index}
                        style={{ marginBottom: 16, padding: 16 }}
                        bordered
                      >
                        {/* Row 1: Medicine, Price, Available Quantity */}
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Form.Item
                              label="Medicine"
                              validateStatus={
                                touched.medicines?.[index]?.Med_Name &&
                                errors.medicines?.[index]?.Med_Name
                                  ? "error"
                                  : ""
                              }
                              help={
                                touched.medicines?.[index]?.Med_Name &&
                                errors.medicines?.[index]?.Med_Name
                              }
                            >
                              <Select
                                placeholder="Select Medicine"
                                value={item.Med_Name}
                                onChange={(val) => {
                                  const selectedMed = medicinesOptions.find(
                                    (m) => m.value === val
                                  );
                                  setFieldValue(
                                    `medicines.${index}.Med_Name`,
                                    val
                                  );
                                  setFieldValue(
                                    `medicines.${index}.Availabe_Med_Qty`,
                                    selectedMed?.quantityAvailable || 0
                                  );
                                  calculateTotalAmount(values);
                                }}
                                options={medicinesOptions.filter(
                                  (option) =>
                                    !values.medicines.some(
                                      (m, idx) =>
                                        m.Med_Name === option.value &&
                                        idx !== index
                                    )
                                )}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item label="Price">
                              <InputNumber
                                value={price}
                                disabled
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item label="Available Quantity">
                              <InputNumber
                                value={item.Availabe_Med_Qty}
                                disabled
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Row 2: Quantity, Total, Remove Button */}
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Form.Item
                              label="Quantity"
                              validateStatus={
                                touched.medicines?.[index]?.Sale_Qty &&
                                errors.medicines?.[index]?.Sale_Qty
                                  ? "error"
                                  : ""
                              }
                              help={
                                touched.medicines?.[index]?.Sale_Qty &&
                                errors.medicines?.[index]?.Sale_Qty
                              }
                            >
                              <InputNumber
                                value={item.Sale_Qty}
                                onChange={(val) => {
                                  setFieldValue(
                                    `medicines[${index}].Sale_Qty`,
                                    val
                                  );
                                  calculateTotalAmount({
                                    ...values,
                                    medicines: values.medicines.map((m, i) =>
                                      i === index ? { ...m, Sale_Qty: val } : m
                                    ),
                                  });
                                }}
                                min={1}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={8}>
                            <Form.Item label="Total">
                              <InputNumber
                                value={lineTotal}
                                disabled
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>

                          <Col
                            span={8}
                            style={{ display: "flex", alignItems: "flex-end" }}
                          >
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                remove(index);
                                calculateTotalAmount({
                                  ...values,
                                  medicines: values.medicines.filter(
                                    (_, i) => i !== index
                                  ),
                                });
                              }}
                              block
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}

                  <Button
                    type="dashed"
                    onClick={() => push({ Med_Name: "", Sale_Qty: 1 })}
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    + Add Medicine
                  </Button>
                </>
              )}
            </FieldArray>

            <Row justify="end" style={{ marginTop: 24 }}>
              <Col>
                <Title level={4}>Total Amount: PKR {totalAmount}</Title>
              </Col>
            </Row>
          </div>
        );

      case 1:
        // Checkout & Discounts Step
        const checkoutColumns = [
          {
            title: 'Medicine',
            dataIndex: 'medicine',
            key: 'medicine',
            render: (medicine, record) => (
              <Space direction="vertical" size="small">
                <strong>{medicine?.name || medicine?.Med_Name}</strong>
                <Tag color="blue">Qty: {record.quantity}</Tag>
              </Space>
            ),
          },
          {
            title: 'Unit Price',
            dataIndex: ['medicine', 'price'],
            key: 'unitPrice',
            render: (price) => `PKR ${price?.toFixed(2) || '0.00'}`,
          },
          {
            title: 'Original Amount',
            dataIndex: 'originalAmount',
            key: 'originalAmount',
            render: (amount) => `PKR ${amount?.toFixed(2) || '0.00'}`,
          },
          {
            title: 'Discount',
            dataIndex: 'discountApplied',
            key: 'discount',
            render: (discount) => {
              if (!discount) {
                return <Tag color="default">No Discount</Tag>;
              }
              return (
                <Space direction="vertical" size="small">
                  <Tag color="green">{discount.name}</Tag>
                  <span style={{ color: '#52c41a' }}>
                    -PKR {discount.discountAmount?.toFixed(2)}
                  </span>
                </Space>
              );
            },
          },
          {
            title: 'Final Amount',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            render: (amount) => (
              <strong style={{ color: '#1890ff' }}>
                PKR {amount?.toFixed(2) || '0.00'}
              </strong>
            ),
          },
        ];

        return (
          <div style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>Checkout & Apply Discounts</Title>
              <p>Review your sale items and apply available discounts</p>
            </div>

            {isCalculatingDiscount && (
              <Alert
                message="Calculating available discounts..."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            {discountData ? (
              <>
                <Table
                  columns={checkoutColumns}
                  dataSource={discountData.items}
                  rowKey={(record, index) => index}
                  pagination={false}
                  style={{ marginBottom: 24 }}
                />
                
                <Card>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="Subtotal"
                        value={discountData.summary.totalOriginalAmount}
                        precision={2}
                        prefix="PKR"
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Total Discount"
                        value={discountData.summary.totalDiscountAmount}
                        precision={2}
                        prefix="PKR"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Total Savings"
                        value={discountData.summary.totalSavings}
                        precision={2}
                        prefix="PKR"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Final Total"
                        value={discountData.summary.totalFinalAmount}
                        precision={2}
                        prefix="PKR"
                        valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                      />
                    </Col>
                  </Row>
                </Card>
                
                {discountData.summary.totalSavings > 0 && (
                  <Alert
                    message={`Excellent! Customer saves PKR ${discountData.summary.totalSavings.toFixed(2)} with applied discounts!`}
                    type="success"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Button
                    onClick={() => calculateSaleDiscounts(values)}
                    loading={isCalculatingDiscount}
                  >
                    Recalculate Discounts
                  </Button>
                </div>
              </>
            ) : (
              <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div>
                  <Title level={4}>Calculate Available Discounts</Title>
                  <p>Click below to check for applicable discounts on selected medicines</p>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => calculateSaleDiscounts(values)}
                    loading={isCalculatingDiscount}
                  >
                    Calculate Discounts
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 2:
        // Review & Print Step  
        const finalTotal = discountData?.summary?.totalFinalAmount || totalAmount;
        const savings = discountData?.summary?.totalSavings || 0;
        
        return (
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={4}>Review Order Details</Title>
            </div>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" title="Customer Information">
                  <p>
                    <strong>Name:</strong> {values.C_Name}
                  </p>
                  <p>
                    <strong>Customer ID:</strong> {generateCustomerId()}
                  </p>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small" title="Order Summary">
                  <p>
                    <strong>Total Items:</strong> {values.medicines.length}
                  </p>
                  {savings > 0 && (
                    <p style={{ color: '#52c41a' }}>
                      <strong>Total Savings:</strong> PKR {savings.toFixed(2)}
                    </p>
                  )}
                  <p>
                    <strong>Final Amount:</strong> <span style={{ color: '#1890ff', fontSize: '18px' }}>PKR {finalTotal?.toFixed(2)}</span>
                  </p>
                </Card>
              </Col>
            </Row>

            <Divider>Order Items</Divider>

            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Original Total</th>
                  {discountData && <th>Discount</th>}
                  <th>Final Total</th>
                </tr>
              </thead>
              <tbody>
                {values.medicines.map((item, index) => {
                  const med = medicinesData.find(
                    (m) => m._id === item.Med_Name
                  );
                  const discountItem = discountData?.items?.[index];
                  const originalTotal = med?.Med_Price * item.Sale_Qty;
                  const finalItemTotal = discountItem?.finalAmount || originalTotal;
                  const itemDiscount = discountItem?.discountApplied;
                  
                  return (
                    <tr key={index}>
                      <td>{med?.Med_Name}</td>
                      <td>{item.Sale_Qty}</td>
                      <td>PKR {med?.Med_Price}</td>
                      <td>PKR {originalTotal.toFixed(2)}</td>
                      {discountData && (
                        <td>
                          {itemDiscount ? (
                            <span style={{ color: '#52c41a' }}>
                              {itemDiscount.name}<br/>
                              -PKR {itemDiscount.discountAmount?.toFixed(2)}
                            </span>
                          ) : (
                            <span style={{ color: '#999' }}>No discount</span>
                          )}
                        </td>
                      )}
                      <td>
                        <strong style={{ color: '#1890ff' }}>
                          PKR {finalItemTotal.toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {savings > 0 && (
              <Alert
                message={`Great! Your customer is saving PKR ${savings.toFixed(2)} on this purchase!`}
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card
        style={{
          // maxWidth: 1200,
          margin: "0 auto",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 40 }}
        />

        <Formik
          initialValues={{
            C_Name: "",
            medicines: [
              {
                Med_Name: "",
                Sale_Qty: 1,
                Availabe_Med_Qty: "",
              },
            ],
          }}
          validationSchema={validationSchema[currentStep]}
          onSubmit={async (values, { resetForm }) => {
            if (currentStep === steps.length - 1) {
              const finalTotal = discountData?.summary?.totalFinalAmount || calculateTotalAmount(values);
              const savings = discountData?.summary?.totalSavings || 0;
              
              const generatedInvoice = {
                invoiceId: generateInvoiceId(),
                customerId: generateCustomerId(),
                customerName: values.C_Name,                
                items: values.medicines.map((item) => {
                  const med = medicinesData.find(
                    (m) => m._id === item.Med_Name
                  );
                  return {
                    name: med?.Med_Name || "",
                    price: med?.Med_Price || 0,
                    quantity: item.Sale_Qty,
                  };
                }),
                totalAmount: finalTotal,
                totalSavings: savings,
                date: moment().format("YYYY-MM-DD"),
                time: moment().format("HH:mm:ss A"),
                pharmacyInfo,
              };
              await handleSaleSubmit(generatedInvoice);
            }
          }}
          validateOnBlur={true}
          validateOnChange={true}
          validateOnMount={true}
        >
          {(formikProps) => {
            const { handleSubmit, isValid, dirty } = formikProps;

            return (
              <Form layout="vertical" onFinish={handleSubmit}>
                {renderStepContent(currentStep, formikProps)}

                <Divider />

                <div style={{ marginTop: 24, textAlign: "right" }}>
                  {currentStep > 0 && (
                    <Button style={{ marginRight: 8 }} onClick={prev}>
                      Previous
                    </Button>
                  )}

                  <Button
                    type="primary"
                    disabled={currentStep === 0 && !dirty}
                    onClick={() => {
                      if (currentStep === steps.length - 1) {
                        handleSubmit();
                      } else {
                        next(formikProps);
                      }
                    }}
                  >
                    {currentStep === steps.length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>

                <Modal
                  modalOpen={modalOpen}
                  title={"Print/Download Invoice"}
                  centered={true}
                  style={{ top: 20, width: 500 }}
                  setModal={toggleModal}
                  actionBtns={[
                    <Button
                      onClick={() => {
                        toggleModal(false);
                        setInvoiceData({});
                      }}
                      type="default"
                      size="large"
                    >
                      Cancel
                    </Button>,
                    <Button
                      type="primary"
                      size="large"
                      onClick={() =>
                        handlePrint(formikProps.values, formikProps.resetForm)
                      }
                      loading={printBtnLoading}
                    >
                      Print Invoice
                    </Button>,
                  ]}
                >
                  {/* Invoice Preview Component */}
                  {Object.keys(invoiceData).length > 0 && (
                    <div
                      ref={invoiceRef}
                      style={{ 
                        width: "80mm", 
                        padding: 12, 
                        display: "block", 
                        margin: "0 auto",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontFamily: "'Courier New', monospace",
                        fontSize: "11px",
                        lineHeight: "1.4"
                      }}
                    >
                      <div style={{ textAlign: "center", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #000" }}>
                        <img
                          src={invoiceData.pharmacyInfo?.pharmacyLogo || defaultPharmacyInfo.pharmacyLogo}
                          alt="Logo"
                          style={{ width: 50, height: "auto", marginBottom: 8, borderRadius: "50%" }}
                        />
                        <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {invoiceData.pharmacyInfo?.pharmacyName || defaultPharmacyInfo.pharmacyName}
                        </h3>
                        <div style={{ fontSize: 10, fontStyle: "italic", color: "#555" }}>
                          {invoiceData.pharmacyInfo?.description || defaultPharmacyInfo.description}
                        </div>
                        <div style={{ fontSize: 9, margin: "4px 0" }}>
                          {invoiceData.pharmacyInfo?.address?.street || defaultPharmacyInfo.address.street}<br/>
                          {invoiceData.pharmacyInfo?.address?.city || defaultPharmacyInfo.address.city}, {invoiceData.pharmacyInfo?.address?.state || defaultPharmacyInfo.address.state}<br/>
                          Tel: {invoiceData.pharmacyInfo?.contactInfo?.phone || defaultPharmacyInfo.contactInfo.phone}
                        </div>
                        <div style={{ fontSize: 8, color: "#666" }}>
                          License: {invoiceData.pharmacyInfo?.licenseNumber || defaultPharmacyInfo.licenseNumber}
                        </div>
                      </div>

                      <div style={{ textAlign: "center", margin: "10px 0", padding: "6px 0", background: "#f0f0f0", border: "1px solid #ccc" }}>
                        <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>SALES INVOICE</div>
                        <div>Invoice #: {invoiceData.invoiceId}</div>
                      </div>

                      <div style={{ margin: "10px 0", padding: 6, background: "#f9f9f9", border: "1px dashed #999" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 10 }}>
                          <span><strong>Customer:</strong></span>
                          <span>{invoiceData.customerName}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 10 }}>
                          <span><strong>Customer ID:</strong></span>
                          <span>{invoiceData.customerId}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 10 }}>
                          <span><strong>Date:</strong></span>
                          <span>{invoiceData.date}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 10 }}>
                          <span><strong>Time:</strong></span>
                          <span>{invoiceData.time}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                      <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", margin: "8px 0" }}>
                        <thead>
                          <tr style={{ background: "#e0e0e0" }}>
                            <th style={{ textAlign: "left", padding: "4px 2px", fontWeight: "bold", borderBottom: "1px solid #999" }}>Item</th>
                            <th style={{ textAlign: "center", padding: "4px 2px", fontWeight: "bold", borderBottom: "1px solid #999" }}>Qty</th>
                            <th style={{ textAlign: "right", padding: "4px 2px", fontWeight: "bold", borderBottom: "1px solid #999" }}>Price</th>
                            <th style={{ textAlign: "right", padding: "4px 2px", fontWeight: "bold", borderBottom: "1px solid #999" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items?.map((item, index) => {
                            const discountItem = discountData?.items?.[index];
                            const hasDiscount = discountItem?.discountApplied && discountItem.finalAmount < (item.price * item.quantity);
                            const finalAmount = discountItem?.finalAmount || (item.price * item.quantity);
                            
                            return (
                              <tr key={index} style={{ borderBottom: "1px dotted #ccc" }}>
                                <td style={{ padding: "3px 2px", fontWeight: "bold", maxWidth: "30mm", wordWrap: "break-word" }}>
                                  {item.name}
                                </td>
                                <td style={{ padding: "3px 2px", textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ padding: "3px 2px", textAlign: "right" }}>PKR {item.price.toFixed(2)}</td>
                                <td style={{ padding: "3px 2px", textAlign: "right" }}>
                                  {hasDiscount ? (
                                    <div>
                                      <div style={{ textDecoration: "line-through", color: "#999", fontSize: "8px" }}>
                                        PKR {(item.price * item.quantity).toFixed(2)}
                                      </div>
                                      <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
                                        PKR {finalAmount.toFixed(2)}
                                      </div>
                                    </div>
                                  ) : (
                                    `PKR ${finalAmount.toFixed(2)}`
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                      {(invoiceData.totalSavings || 0) > 0 && (
                        <div style={{ background: "#e8f5e8", padding: 4, margin: "4px 0", border: "1px dashed #4CAF50", fontSize: 9 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 2 }}>💰 Savings Applied!</div>
                          <div>You saved PKR {(invoiceData.totalSavings || 0).toFixed(2)} on this purchase</div>
                        </div>
                      )}

                      <div style={{ margin: "10px 0", padding: 8, background: "#f5f5f5", border: "1px solid #ddd" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "3px 0", fontSize: 10 }}>
                          <span>Total Items:</span>
                          <span><strong>{invoiceData.items?.length || 0}</strong></span>
                        </div>
                        {(invoiceData.totalSavings || 0) > 0 && (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", margin: "3px 0", fontSize: 10 }}>
                              <span>Subtotal:</span>
                              <span>PKR {((invoiceData.totalAmount || 0) + (invoiceData.totalSavings || 0)).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", margin: "3px 0", fontSize: 10, color: "#4CAF50", fontWeight: "bold" }}>
                              <span>Total Savings:</span>
                              <span>-PKR {(invoiceData.totalSavings || 0).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: "bold", padding: "4px 0", borderTop: "2px solid #000", marginTop: 4 }}>
                          <span>TOTAL AMOUNT:</span>
                          <span>PKR {(invoiceData.totalAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: "2px solid #000", margin: "8px 0" }} />

                      <div style={{ textAlign: "center", marginTop: 12, paddingTop: 8, borderTop: "2px solid #000", fontSize: 8, lineHeight: "1.3" }}>
                        <div style={{ fontSize: 10, fontWeight: "bold", margin: "4px 0" }}>Thank You for Your Purchase!</div>
                        <div>Your health is our priority</div>
                        <div style={{ width: 30, height: 30, background: "#ddd", margin: "8px auto", border: "1px solid #999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6 }}>
                          QR
                        </div>
                        <div style={{ fontSize: 7, color: "#666", margin: "2px 0" }}>
                          • Medicine returns accepted within 7 days with receipt<br/>
                          • Keep this receipt for warranty claims<br/>
                          • For queries: {invoiceData.pharmacyInfo?.contactInfo?.phone || defaultPharmacyInfo.contactInfo.phone}
                        </div>
                        <div style={{ marginTop: 8, fontWeight: "bold" }}>
                          Generated by Al Shifa Pharmacy Management System
                        </div>
                        <div style={{ marginTop: 4, borderTop: "1px dashed #000", paddingTop: 4 }}>
                          *** End of Receipt ***
                        </div>
                      </div>
                    </div>
                  )}
                </Modal>
              </Form>
            );
          }}
        </Formik>
      </Card>
    </div>
  );
};

export default WithMessages(WithLoader(AddSale));
