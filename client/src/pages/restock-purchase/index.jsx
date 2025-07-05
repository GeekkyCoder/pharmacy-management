import React,{useEffect,useState} from "react";
import { Formik, FieldArray, Form } from "formik";
import { Button, DatePicker, Form as AntForm, Input, InputNumber, Space, Card, Row, Col, Typography, Divider } from "antd";
import * as Yup from "yup";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { useLocation, useNavigate } from "react-router-dom";
import { restockMedicine } from "./apiCalls";
import axios from "axios"

const { Title } = Typography;

const RestockMedicineForm = (props) => {
  const user = useSelector((state) => state?.auth?.user);

  const navigate = useNavigate();

  const location = useLocation()

  const { medicineData,canAddMore } = location.state

  console.log("medicineData", medicineData)


  const initialValues = {
    Sup_Name: medicineData?.Sup_Name || "",
    Sup_Phno: medicineData?.Sup_Phno || "",
    purchase: {
      P_Name: medicineData?.Med_Name || "",
      P_Qty: medicineData?.Med_Qty || 1,
      P_Cost: medicineData?.Med_Price || 0,
      Mfg_Date: medicineData?.Manufacture_Date,
      Exp_Date: medicineData?.Expiry_Date,
      Pur_Date: medicineData?.Purchase_Date,
    },
  };

  const validationSchema = Yup.object().shape({
    Sup_Name: Yup.string().nullable(),
    Sup_Phno: Yup.string().nullable(),
    purchase: Yup.object().shape({
        P_Name: Yup.string().required("Medicine Name is required"),
        P_Qty: Yup.number().positive().required("Quantity is required"),
        P_Cost: Yup.number().positive().required("Cost is required"),
        Mfg_Date: Yup.mixed().required("Required"),
        Exp_Date: Yup.mixed().required("Required"),
        Pur_Date: Yup.mixed().required("Required"),
      })
  });

  const handleSubmit = async (values, resetForm) => {
    props.setLoading(true);

    const body = {
      _id: medicineData?._id,
      Med_Name: values?.purchase?.P_Name,
      Med_Qty: values?.purchase?.P_Qty,
      Med_Price: values?.purchase?.P_Cost,
      Manufacture_Date: values?.purchase?.Mfg_Date,
      Expiry_Date: values?.purchase?.Exp_Date,
      Purchase_Date: values?.purchase?.Pur_Date,
    };

    // Calling the restockMedcine API
    await restockMedicine(body, onSuccess, onFailure);

    resetForm();
    navigate(-1)
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
  {({ values, setFieldValue, touched, errors, dirty }) => (
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
      <Card type="inner" title="Medicine">
        <Row gutter={16}>
          <Col span={8}>
            <AntForm.Item label="Medicine Name">
              <Input value={values.purchase.P_Name} disabled />
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item label="Quantity">
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                value={values.purchase.P_Qty}
                onChange={(val) => setFieldValue("purchase.P_Qty", val)}
              />
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item label="Price (per unit)">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                value={values.purchase.P_Cost}
                onChange={(val) => setFieldValue("purchase.P_Cost", val)}
              />
            </AntForm.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <AntForm.Item label="Purchase Date">
              <DatePicker
                style={{ width: "100%" }}
                value={dayjs(values.purchase.Pur_Date)}
                onChange={(val) => setFieldValue("purchase.Pur_Date", val)}
              />
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item label="Mfg Date">
              <DatePicker
                style={{ width: "100%" }}
                value={dayjs(values.purchase.Mfg_Date)}
                onChange={(val) => setFieldValue("purchase.Mfg_Date", val)}
              />
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item label="Exp Date">
              <DatePicker
                style={{ width: "100%" }}
                value={dayjs(values.purchase.Exp_Date)}
                onChange={(val) => setFieldValue("purchase.Exp_Date", val)}
              />
            </AntForm.Item>
          </Col>
        </Row>

        <p style={{ fontWeight: 500 }}>
          💰 <strong>Total:</strong> Rs.{" "}
          {(values.purchase.P_Qty * values.purchase.P_Cost).toFixed(2)}
        </p>
      </Card>

      <Divider />
      <div style={{ textAlign: "center" }}>
        <Button type="primary" disabled={!dirty} htmlType="submit" size="large">
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
