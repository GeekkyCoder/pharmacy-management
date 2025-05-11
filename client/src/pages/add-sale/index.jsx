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
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import generateCustomerId from "../../utils/generateCustomerID";
import { useSelector } from "react-redux";
import { createNewSale, getAllMedicines } from "./apiCalls";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import generateInvoiceId from "../../utils/generateInvoiceId";
import useModal from "../../components/modal/useModal";
import Modal from "../../components/modal";

const { Title } = Typography;

// Dummy Pharmacy Details
const pharmacyName = "HealthPlus Pharmacy";
const pharmacyLogo =
  "https://static.vecteezy.com/system/resources/previews/023/432/110/non_2x/low-poly-and-creative-medical-pharmacy-logo-design-design-concept-free-vector.jpg";

const steps = [
  {
    title: "Sale Information",
    content: "First-content",
  },
  {
    title: "Review & Print",
    content: "Second-content",
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
  // Second step validation
  Yup.object({}), // No validation needed for review step
];

const AddSale = (props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [medicinesData, setMedicinesData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceData, setInvoiceData] = useState({});
  const [printBtnLoading, setPrintBtnLoading] = useState(false);
  const invoiceRef = useRef(null);
  const { modalOpen, toggleModal } = useModal();
  const user = useSelector((state) => state.auth.user);

  const calculateTotalAmount = useCallback(
    (values) => {
      let total = 0;
      values.medicines.forEach((item) => {
        const med = medicinesData.find((m) => m._id === item.Med_Name);
        const price = med?.Med_Price || 0;
        total += price * (item.Sale_Qty || 0);
      });
      setTotalAmount(total);
      return total; // Return total for immediate use
    },
    [medicinesData]
  );

  const handlePrint = async (values, resetForm) => {
    const printContents = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=400");
    setPrintBtnLoading(true);
    props.setLoading(true);

    // Recalculate total before printing
    const calculatedTotal = calculateTotalAmount(values);

    const body = {
      invoiceId: generateInvoiceId(),
      customerId: generateCustomerId(),
      customerName: values.C_Name,
      items: values.medicines.map((item) => {
        const med = medicinesData.find((m) => m._id === item.Med_Name);
        return {
          name: med?.Med_Name || "",
          price: med?.Med_Price || 0,
          quantity: item.Sale_Qty,
        };
      }),
      totalAmount: calculatedTotal,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss A"),
      pharmacyName,
      pharmacyLogo,
    };

    const reqBody = {
      invoiceId: body?.invoiceId,
      C_Name: body?.customerName,
      C_ID: body?.customerId,
      employeeId: user?._id,
      totalPrice: calculatedTotal,
      medicines: body.items.map((item) => {
        const med = medicinesData.find((m) => m.Med_Name === item.name);
        return {
          Med_ID: med?._id,
          Sale_Qty: item?.quantity,
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
              <title>Print Invoice</title>
              <style>
                @page {
                  margin: 0;
                  size: 58mm 210mm;
                }
                body {
                  font-family: 'Courier New', monospace;
                  margin: 0;
                  padding: 8px;
                  width: 58mm;
                  font-size: 10px;
                  line-height: 1.2;
                }
                .header {
                  text-align: center;
                  margin-bottom: 10px;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 5px;
                }
                .logo {
                  max-width: 50px;
                  height: auto;
                  margin: 0 auto;
                  display: block;
                }
                .pharmacy-name {
                  font-size: 14px;
                  font-weight: bold;
                  margin: 5px 0;
                }
                .invoice-details {
                  margin: 8px 0;
                  font-size: 9px;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 5px 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 9px;
                  margin: 8px 0;
                }
                th, td {
                  text-align: left;
                  padding: 3px 0;
                }
                .item-row td {
                  border-bottom: 1px dotted #ccc;
                }
                .total-section {
                  margin-top: 8px;
                  text-align: right;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 10px;
                  text-align: center;
                  font-size: 8px;
                  border-top: 1px dashed #000;
                  padding-top: 5px;
                }
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="${pharmacyLogo}" class="logo" alt="Logo">
                <div class="pharmacy-name">${pharmacyName}</div>
                <div>Medical Store & Pharmacy</div>
                <div style="font-size: 8px">Colony No1 Guddu Road, Kashmore</div>
                <div style="font-size: 8px">Tel: (0314) 7320-407</div>
              </div>

              <div class="invoice-details">
                <div>Invoice #: ${body.invoiceId}</div>
                <div>Date: ${body.date}</div>
                <div>Time: ${body.time}</div>
                <div>Customer: ${body.customerName}</div>
                <div>Customer ID: ${body.customerId}</div>
              </div>

              <div class="divider"></div>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${body.items
                    .map(
                      (item) => `
                    <tr class="item-row">
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${item.price * item.quantity}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div class="total-section">
                <div>Total Items: ${body.items.length}</div>
                <div style="font-size: 12px">Total Amount: PKR ${calculatedTotal}</div>
              </div>

              <div class="footer">
                <div>Thank you for your purchase!</div>
                <div>Please keep this receipt for your records</div>
                <div style="margin-top: 5px">*** End of Receipt ***</div>
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
        props.error("Could not fetch medicines");
      }
    } catch (err) {
      props.error("Something Went Wrong");
    } finally {
      props.setLoading(false);
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
  }, [getMedicines]);

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
        setCurrentStep(currentStep + 1);
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
                  <p>
                    <strong>Total Amount:</strong> PKR {totalAmount}
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
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {values.medicines.map((item, index) => {
                  const med = medicinesData.find(
                    (m) => m._id === item.Med_Name
                  );
                  return (
                    <tr key={index}>
                      <td>{med?.Med_Name}</td>
                      <td>{item.Sale_Qty}</td>
                      <td>PKR {med?.Med_Price}</td>
                      <td>PKR {med?.Med_Price * item.Sale_Qty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                totalAmount,
                date: moment().format("YYYY-MM-DD"),
                time: moment().format("HH:mm:ss A"),
                pharmacyName,
                pharmacyLogo,
              };
              await handleSaleSubmit(generatedInvoice, resetForm);
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
                    disabled={!dirty}
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
                      style={{ width: "58mm", padding: 10 }}
                    >
                      <div style={{ textAlign: "center", marginBottom: 10 }}>
                        <img
                          src={invoiceData.pharmacyLogo}
                          alt="Logo"
                          style={{ width: 50, height: "auto" }}
                        />
                        <h3 style={{ margin: "5px 0" }}>
                          {invoiceData.pharmacyName}
                        </h3>
                        <div style={{ fontSize: 12 }}>
                          Medical Store & Pharmacy
                        </div>
                        <div style={{ fontSize: 10 }}>
                          Colony No1 Guddu Road, Kashmore
                        </div>
                        <div style={{ fontSize: 10 }}>Tel: (0344) 992-1234</div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed #000",
                          marginBottom: 10,
                        }}
                      />

                      <div style={{ fontSize: 10, marginBottom: 10 }}>
                        <div>Invoice #: {invoiceData.invoiceId}</div>
                        <div>Date: {invoiceData.date}</div>
                        <div>Time: {invoiceData.time}</div>
                        <div>Customer: {invoiceData.customerName}</div>
                        <div>Customer ID: {invoiceData.customerId}</div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed #000",
                          marginBottom: 10,
                        }}
                      />

                      <table
                        style={{
                          width: "100%",
                          fontSize: 10,
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left" }}>Item</th>
                            <th style={{ textAlign: "left" }}>Qty</th>
                            <th style={{ textAlign: "left" }}>Price</th>
                            <th style={{ textAlign: "left" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.items.map((item, index) => (
                            <tr
                              key={index}
                              style={{ borderBottom: "1px dotted #ccc" }}
                            >
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.price}</td>
                              <td>{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div
                        style={{
                          textAlign: "right",
                          marginTop: 10,
                          fontWeight: "bold",
                        }}
                      >
                        <div>Total Items: {invoiceData.items.length}</div>
                        <div style={{ fontSize: 12 }}>
                          Total Amount: PKR {invoiceData.totalAmount}
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed #000",
                          marginTop: 10,
                          paddingTop: 10,
                          textAlign: "center",
                          fontSize: 8,
                        }}
                      >
                        <div>Thank you for your purchase!</div>
                        <div>Please keep this receipt for your records</div>
                        <div style={{ marginTop: 5 }}>
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
