// import React from "react";
// import { Formik, FieldArray, Form } from "formik";
// import {
//   Button,
//   DatePicker,
//   Form as AntForm,
//   Input,
//   InputNumber,
//   Space,
//   Card,
//   Row,
//   Col,
//   Typography,
//   Divider,
// } from "antd";
// import * as Yup from "yup";
// import dayjs from "dayjs";
// import { useSelector } from "react-redux";
// import { createPurchase } from "./apiCalls";
// import WithLoader from "../../hocs/loader";
// import WithMessages from "../../hocs/messages";

// const { Title } = Typography;

// const SupplierPurchaseForm = (props) => {
//   const user = useSelector((state) => state?.auth?.user);

//   const initialValues = {
//     Sup_Name: "",
//     Sup_Phno: "",
//     purchases: [
//       {
//         P_Name: "",
//         P_Qty: 1,
//         P_Cost: 0,
//         Mfg_Date: dayjs(),
//         Exp_Date: dayjs(),
//         Pur_Date: dayjs(),
//       },
//     ],
//   };

//   const validationSchema = Yup.object().shape({
//     Sup_Name: Yup.string()
//       .required("Name is required")
//       .matches(/^[A-Za-z ]+$/, "Name can contain only letters"),
//     Sup_Phno: Yup.string()
//       .required("Phone is required")
//       .test("phone-number-check", "should start with 03", function (value) {
//         return value && value.startsWith("03");
//       })
//       .test(
//         "digits-check",
//         "phone number should be atleast of 11 digits",
//         function (value) {
//           return value && value.length === 11;
//         }
//       ),
//     purchases: Yup.array().of(
//       Yup.object().shape({
//         P_Name: Yup.string().required("Medicine Name is required"),
//         P_Qty: Yup.number().positive().required("Quantity is required"),
//         P_Cost: Yup.number().positive().required("Cost is required"),
//         Mfg_Date: Yup.mixed().required("Required"),
//         Exp_Date: Yup.mixed().required("Required"),
//         Pur_Date: Yup.mixed().required("Required"),
//       })
//     ),
//   });

//   const handleSubmit = async (values, resetForm) => {
//     props.setLoading(true);

//     const body = {
//       ...values,
//       purchaseMadeBy: user?._id,
//     };

//     const response = await createPurchase(body, onSuccess, onFailure);

//     if (response) resetForm();

//     props.setLoading(false);
//   };

//   const onSuccess = (options) => {
//     props.success(options?.message);
//   };

//   const onFailure = (options) => {
//     props.success(options?.message);
//   };

//   return (
//     <Card style={{ padding: 24 }}>
//       <Title level={3}>Supplier & Purchase Entry</Title>

//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={async (values, { setSubmitting, resetForm }) => {
//           setSubmitting(true);
//           await handleSubmit(values, resetForm);
//           setSubmitting(false);
//         }}
//       >
//         {({ values, setFieldValue, touched, errors }) => {
//           console.log(`errors`, errors);
//           return (
//             <Form style={{ margin: "3em 0" }}>
//               {/* <AntForm layout="vertical"> */}
//               <Divider orientation="left">Supplier Details</Divider>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <AntForm.Item label="Name">
//                     <Input
//                       value={values.Sup_Name}
//                       onChange={(e) =>
//                         setFieldValue("Sup_Name", e.target.value)
//                       }
//                     />
//                     {touched.Sup_Name && errors.Sup_Name && (
//                       <div className="error">{errors.Sup_Name}</div>
//                     )}
//                   </AntForm.Item>
//                 </Col>
//                 <Col span={8}>
//                   <AntForm.Item label="Phone">
//                     <Input
//                       value={values.Sup_Phno}
//                       onChange={(e) =>
//                         setFieldValue("Sup_Phno", e.target.value)
//                       }
//                     />
//                     {touched.Sup_Phno && errors.Sup_Phno && (
//                       <div className="error">{errors.Sup_Phno}</div>
//                     )}
//                   </AntForm.Item>
//                 </Col>
//               </Row>

//               <Divider orientation="left">Purchase Details</Divider>
//               <FieldArray name="purchases">
//                 {({ push, remove }) => (
//                   <>
//                     {values.purchases.map((purchase, index) => {
//                       const total =
//                         (purchase.P_Qty || 0) * (purchase.P_Cost || 0);
//                       return (
//                         <Card
//                           key={index}
//                           type="inner"
//                           title={`Medicine #${index + 1}`}
//                           style={{ marginBottom: 24 }}
//                           extra={
//                             index > 0 && (
//                               <Button
//                                 type="text"
//                                 danger
//                                 onClick={() => remove(index)}
//                               >
//                                 Remove
//                               </Button>
//                             )
//                           }
//                         >
//                           <Row gutter={16}>
//                             <Col span={8}>
//                               <AntForm.Item label="Medicine Name">
//                                 <Input
//                                   value={purchase.P_Name}
//                                   onChange={(e) =>
//                                     setFieldValue(
//                                       `purchases[${index}].P_Name`,
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.P_Name &&
//                                   errors.purchases?.[index]?.P_Name && (
//                                     <div className="error">
//                                       {errors.purchases[index].P_Name}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                             <Col span={8}>
//                               <AntForm.Item label="Quantity">
//                                 <InputNumber
//                                   min={1}
//                                   style={{ width: "100%" }}
//                                   value={purchase.P_Qty}
//                                   onChange={(val) =>
//                                     setFieldValue(
//                                       `purchases[${index}].P_Qty`,
//                                       val
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.P_Qty &&
//                                   errors.purchases?.[index]?.P_Qty && (
//                                     <div className="error">
//                                       {errors.purchases[index].P_Qty}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                             <Col span={8}>
//                               <AntForm.Item label="Price (per unit)">
//                                 <InputNumber
//                                   min={0}
//                                   style={{ width: "100%" }}
//                                   value={purchase.P_Cost}
//                                   onChange={(val) =>
//                                     setFieldValue(
//                                       `purchases[${index}].P_Cost`,
//                                       val
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.P_Cost &&
//                                   errors.purchases?.[index]?.P_Cost && (
//                                     <div className="error">
//                                       {errors.purchases[index].P_Cost}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                           </Row>

//                           <Row gutter={16}>
//                             <Col span={8}>
//                               <AntForm.Item label="Purchase Date">
//                                 <DatePicker
//                                 disabled
//                                   style={{ width: "100%" }}
//                                   value={dayjs(purchase.Pur_Date)}
//                                   onChange={(date) =>
//                                     setFieldValue(
//                                       `purchases[${index}].Pur_Date`,
//                                       date
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.Pur_Date &&
//                                   errors.purchases?.[index]?.Pur_Date && (
//                                     <div className="error">
//                                       {errors.purchases[index].Pur_Date}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                             <Col span={8}>
//                               <AntForm.Item label="Mfg Date">
//                                 <DatePicker
//                                   style={{ width: "100%" }}
//                                   value={dayjs(purchase.Mfg_Date)}
//                                   onChange={(date) =>
//                                     setFieldValue(
//                                       `purchases[${index}].Mfg_Date`,
//                                       date
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.Mfg_Date &&
//                                   errors.purchases?.[index]?.Mfg_Date && (
//                                     <div className="error">
//                                       {errors.purchases[index].Mfg_Date}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                             <Col span={8}>
//                               <AntForm.Item label="Exp Date">
//                                 <DatePicker
//                                   style={{ width: "100%" }}
//                                   value={dayjs(purchase.Exp_Date)}
//                                   onChange={(date) =>
//                                     setFieldValue(
//                                       `purchases[${index}].Exp_Date`,
//                                       date
//                                     )
//                                   }
//                                 />
//                                 {touched.purchases?.[index]?.Exp_Date &&
//                                   errors.purchases?.[index]?.Exp_Date && (
//                                     <div className="error">
//                                       {errors.purchases[index].Exp_Date}
//                                     </div>
//                                   )}
//                               </AntForm.Item>
//                             </Col>
//                           </Row>

//                           <p style={{ fontWeight: 500 }}>
//                             💰 <strong>Total:</strong> Rs. {total.toFixed(2)}
//                           </p>
//                         </Card>
//                       );
//                     })}

//                     <Button
//                       type="dashed"
//                       block
//                       onClick={() =>
//                         push({
//                           P_Name: "",
//                           P_Qty: 1,
//                           P_Cost: 0,
//                           Mfg_Date: dayjs(),
//                           Exp_Date: dayjs(),
//                           Pur_Date: dayjs(),
//                         })
//                       }
//                     >
//                       + Add More Medicine
//                     </Button>
//                   </>
//                 )}
//               </FieldArray>

//               <Divider />
//               <div style={{ textAlign: "center" }}>
//                 <Button type="primary" htmlType="submit" size="large">
//                   Submit Purchase
//                 </Button>
//               </div>
//               {/* </AntForm> */}
//             </Form>
//           );
//         }}
//       </Formik>
//     </Card>
//   );
// };

// export default WithMessages(WithLoader(SupplierPurchaseForm));




import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Button,
  Input,
  InputNumber,
  DatePicker,
  Card,
  Row,
  Col,
  Steps,
  Divider,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { createPurchase } from "./apiCalls";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";

const { Title } = Typography;
const { Step } = Steps;

const SupplierPurchaseMultiStep = (props) => {
  const user = useSelector((state) => state?.auth?.user);
  const [current, setCurrent] = useState(0);

  const initialValues = {
    Sup_Name: "",
    Sup_Phno: "",
    purchases: [
      {
        P_Name: "",
        P_Qty: 1,
        P_Cost: 0,
        Mfg_Date: dayjs(),
        Exp_Date: dayjs(),
        Pur_Date: dayjs(),
      },
    ],
  };

  const validationSchemas = [
    Yup.object().shape({
      Sup_Name: Yup.string()
        .required("Name is required")
        .matches(/^[A-Za-z ]+$/, "Name can contain only letters"),
      Sup_Phno: Yup.string()
        .required("Phone is required")
        .test("phone-number-check", "should start with 03", (value) =>
          value?.startsWith("03")
        )
        .length(11, "Phone number should be 11 digits"),
    }),
    Yup.object().shape({
      purchases: Yup.array().of(
        Yup.object().shape({
          P_Name: Yup.string().required("Medicine Name is required"),
          P_Qty: Yup.number().positive().required("Quantity is required"),
          P_Cost: Yup.number().positive().required("Cost is required"),
          Mfg_Date: Yup.mixed().required("Mfg Date is required"),
          Exp_Date: Yup.mixed().required("Exp Date is required"),
          Pur_Date: Yup.mixed().required("Purchase Date is required"),
        })
      ),
    }),
  ];

  const handleSubmit = async (values, resetForm) => {
    props.setLoading(true);
    const body = {
      ...values,
      purchaseMadeBy: user?._id,
    };
    const response = await createPurchase(body, onSuccess, onFailure);
    if (response) resetForm();
    props.setLoading(false);
  };

  const onSuccess = (options) => props.success(options?.message);
  const onFailure = (options) => props.error(options?.message); // Fixed: Changed success to error

  const steps = [
    {
      title: "Supplier Details",
      content: ({ values, setFieldValue, errors, touched }) => (
        <Row gutter={16}>
          <Col span={12}>
            <label>Name</label>
            <Input
              value={values.Sup_Name}
              onChange={(e) => setFieldValue("Sup_Name", e.target.value)}
            />
            {touched?.Sup_Name && errors?.Sup_Name && (
              <div className="error">{errors?.Sup_Name}</div>
            )}
          </Col>
          <Col span={12}>
            <label>Phone</label>
            <Input
              value={values.Sup_Phno}
              onChange={(e) => setFieldValue("Sup_Phno", e.target.value)}
            />
            {touched?.Sup_Phno && errors?.Sup_Phno && (
              <div className="error">{errors?.Sup_Phno}</div>
            )}
          </Col>
        </Row>
      ),
    },
    {
      title: "Purchase Details",
      content: ({ values, setFieldValue, errors, touched }) => (
        <>
          {values.purchases.map((purchase, index) => (
            <Card key={index} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <label>Medicine Name</label>
                  <Input
                    value={purchase.P_Name}
                    onChange={(e) =>
                      setFieldValue(`purchases[${index}].P_Name`, e.target.value)
                    }
                  />
                  {touched?.purchases?.[index]?.P_Name &&
                    errors?.purchases?.[index]?.P_Name && (
                      <div className="error">{errors.purchases[index].P_Name}</div>
                    )}
                </Col>
                <Col span={4}>
                  <label>Quantity</label>
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    value={purchase.P_Qty}
                    onChange={(val) =>
                      setFieldValue(`purchases[${index}].P_Qty`, val)
                    }
                  />
                  {touched?.purchases?.[index]?.P_Qty &&
                    errors?.purchases?.[index]?.P_Qty && (
                      <div className="error">{errors.purchases[index].P_Qty}</div>
                    )}
                </Col>
                <Col span={4}>
                  <label>Cost</label>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={purchase.P_Cost}
                    onChange={(val) =>
                      setFieldValue(`purchases[${index}].P_Cost`, val)
                    }
                  />
                  {touched?.purchases?.[index]?.P_Cost &&
                    errors?.purchases?.[index]?.P_Cost && (
                      <div className="error">{errors.purchases[index].P_Cost}</div>
                    )}
                </Col>
                <Col span={8}>
                  <label>Purchase Date</label>
                  <DatePicker
                    disabled
                    style={{ width: "100%" }}
                    value={dayjs(purchase.Pur_Date)}
                    onChange={(val) =>
                      setFieldValue(`purchases[${index}].Pur_Date`, val)
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <label>Mfg Date</label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={dayjs(purchase.Mfg_Date)}
                    onChange={(val) =>
                      setFieldValue(`purchases[${index}].Mfg_Date`, val)
                    }
                  />
                  {touched?.purchases?.[index]?.Mfg_Date &&
                    errors?.purchases?.[index]?.Mfg_Date && (
                      <div className="error">{errors.purchases[index].Mfg_Date}</div>
                    )}
                </Col>
                <Col span={8}>
                  <label>Exp Date</label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={dayjs(purchase.Exp_Date)}
                    onChange={(val) =>
                      setFieldValue(`purchases[${index}].Exp_Date`, val)
                    }
                  />
                  {touched?.purchases?.[index]?.Exp_Date &&
                    errors?.purchases?.[index]?.Exp_Date && (
                      <div className="error">{errors.purchases[index].Exp_Date}</div>
                    )}
                </Col>
              </Row>
            </Card>
          ))}
        </>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Supplier & Purchase Entry</Title>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchemas[current]}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={async (values, { resetForm }) => {
          if (current < steps.length - 1) {
            setCurrent(current + 1);
          } else {
            await handleSubmit(values, resetForm);
          }
        }}
      >
        {({ values, setFieldValue, errors, touched, validateForm, handleSubmit, setTouched }) => (
          <Form>
            <Steps current={current} style={{ marginBottom: 32 }}>
              {steps.map((step, index) => (
                <Step key={index} title={step.title} />
              ))}
            </Steps>

            <div>{steps[current].content({ values, setFieldValue, errors, touched })}</div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {current > 0 && (
                <Button onClick={() => setCurrent(current - 1)}>Back</Button>
              )}
              {current < steps.length - 1 ? (
                <Button
                  type="primary"
                  onClick={() => {
                    validateForm().then((errs) => {
                      if (Object.keys(errs).length === 0) {
                        setCurrent(current + 1);
                      } else {
                        const touchedFields = {};
                        Object.keys(errs).forEach((field) => {
                          if (field.includes("purchases")) {
                            const matches = field.match(/purchases\[(\d+)\]\.(\w+)/);
                            if (matches) {
                              const [_, index, fieldName] = matches;
                              touchedFields[`purchases.${index}.${fieldName}`] = true;
                            }
                          } else {
                            touchedFields[field] = true;
                          }
                        });
                        setTouched(touchedFields);
                      }
                    });
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="primary" htmlType="submit" loading={props.loading}>
                  Submit
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default WithMessages(WithLoader(SupplierPurchaseMultiStep));
