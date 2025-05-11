import React,{useEffect,useState} from "react";
import { Formik, FieldArray, Form } from "formik";
import { Button, DatePicker, Form as AntForm, Input, InputNumber, Space, Card, Row, Col, Typography, Divider } from "antd";
import * as Yup from "yup";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { useLocation } from "react-router-dom";
import axios from "axios"

const { Title } = Typography;

const RestockMedicineForm = (props) => {
  const user = useSelector((state) => state?.auth?.user);

  const location = useLocation()

  const { medicineData } = location.state


  const initialValues = {
    Sup_Name: medicineData?.Sup_Name || "",
    Sup_Phno: medicineData?.Sup_Phno || "",
    purchases: [
      {
        P_Name: medicineData?.Med_Name || "",
        P_Qty: medicineData?.Med_Qty || 1,
        P_Cost: medicineData?.Med_Price || 0,
        Mfg_Date: medicineData?.Manufacture_Date,
        Exp_Date: medicineData?.Expiry_Date,
        Pur_Date: medicineData?.Purchase_Date,
      },
    ],
  };

  const validationSchema = Yup.object().shape({
    Sup_Name: Yup.string().required("Name is required"),
    Sup_Phno: Yup.string().required("Phone is required"),
    purchases: Yup.array().of(
      Yup.object().shape({
        P_Name: Yup.string().required("Medicine Name is required"),
        P_Qty: Yup.number().positive().required("Quantity is required"),
        P_Cost: Yup.number().positive().required("Cost is required"),
        Mfg_Date: Yup.mixed().required("Required"),
        Exp_Date: Yup.mixed().required("Required"),
        Pur_Date: Yup.mixed().required("Required"),
      })
    ),
  });

  const handleSubmit = async (values, resetForm) => {
    props.setLoading(true);

    const body = {
      ...values,
      purchaseMadeBy: user?._id,
    };

    // Call the createPurchase API or any specific API for restocking
    await createPurchase(body, onSuccess, onFailure);

    resetForm();
    props.setLoading(false);
  };

  const onSuccess = (options) => {
    props.success(options?.message);
  };

  const onFailure = (options) => {
    props.success(options?.message);
  };


  return (
    <Card style={{ padding: 24 }}>
      <Title level={3}>Restock Medicine</Title>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          await handleSubmit(values, resetForm);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, touched, errors }) => (
          <Form style={{ margin: "3em 0" }}>
            <Divider orientation="left">Supplier Details</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <AntForm.Item label="Name">
                  <Input value={values.Sup_Name} disabled />
                </AntForm.Item>
              </Col>
              <Col span={8}>
                <AntForm.Item label="Phone">
                  <Input value={values.Sup_Phno} disabled />
                </AntForm.Item>
              </Col>
            </Row>

            <Divider orientation="left">Purchase Details</Divider>
            <FieldArray name="purchases">
              {({ push, remove }) => (
                <>
                  {values.purchases.map((purchase, index) => {
                    const total = (purchase.P_Qty || 0) * (purchase.P_Cost || 0);
                    return (
                      <Card
                        key={index}
                        type="inner"
                        title={`Medicine #${index + 1}`}
                        style={{ marginBottom: 24 }}
                        extra={
                          index > 0 && (
                            <Button type="text" danger onClick={() => remove(index)}>
                              Remove
                            </Button>
                          )
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <AntForm.Item label="Medicine Name">
                              <Input value={purchase.P_Name} disabled />
                            </AntForm.Item>
                          </Col>
                          <Col span={8}>
                            <AntForm.Item label="Quantity">
                              <InputNumber
                                min={1}
                                style={{ width: "100%" }}
                                value={purchase.P_Qty}
                                onChange={(val) => setFieldValue(`purchases[${index}].P_Qty`, val)}
                              />
                            </AntForm.Item>
                          </Col>
                          <Col span={8}>
                            <AntForm.Item label="Price (per unit)">
                              <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                value={purchase.P_Cost}
                                onChange={(val) => setFieldValue(`purchases[${index}].P_Cost`, val)}
                              />
                            </AntForm.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={8}>
                            <AntForm.Item label="Purchase Date">
                              <DatePicker style={{ width: "100%" }} value={dayjs(purchase.Pur_Date)} disabled />
                            </AntForm.Item>
                          </Col>
                          <Col span={8}>
                            <AntForm.Item label="Mfg Date">
                              <DatePicker style={{ width: "100%" }} value={dayjs(purchase.Mfg_Date)} disabled />
                            </AntForm.Item>
                          </Col>
                          <Col span={8}>
                            <AntForm.Item label="Exp Date">
                              <DatePicker style={{ width: "100%" }} value={dayjs(purchase.Exp_Date)} disabled />
                            </AntForm.Item>
                          </Col>
                        </Row>

                        <p style={{ fontWeight: 500 }}>
                          💰 <strong>Total:</strong> Rs. {total.toFixed(2)}
                        </p>
                      </Card>
                    );
                  })}

                  <Button
                    type="dashed"
                    block
                    onClick={() =>
                      push({
                        P_Name: "",
                        P_Qty: 1,
                        P_Cost: 0,
                        Mfg_Date: dayjs(),
                        Exp_Date: dayjs(),
                        Pur_Date: dayjs(),
                      })
                    }
                  >
                    + Add More Medicine
                  </Button>
                </>
              )}
            </FieldArray>

            <Divider />
            <div style={{ textAlign: "center" }}>
              <Button type="primary" htmlType="submit" size="large">
                Submit Restock
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default WithMessages(WithLoader(RestockMedicineForm));
