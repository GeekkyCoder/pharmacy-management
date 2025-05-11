import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Form,
  message,
} from "antd";
import moment from "moment";
import { getEmployeeById, updateEmployee } from "./apiCalls";
import { useNavigate, useParams } from "react-router-dom";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";

const { Title } = Typography;
const { Option } = Select;

const UpdateEmployee = (props) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);

  const validationSchema = Yup.object({
    E_Fname: Yup.string().required("First name is required"),
    E_Lname: Yup.string().required("Last name is required"),
    E_Sex: Yup.string().required("Sex is required"),
    E_Phno: Yup.string().required("Phone is required"),
    // E_date: Yup.date().required("Join date is required"),
  });

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  const fetchEmployeeDetails = async () => {
    props.setLoading(true);
    const response = await getEmployeeById(employeeId);
    if (response) {
      const emp = response;
      setInitialValues({
        E_Fname: emp.E_Fname || "",
        E_Lname: emp.E_Lname || "",
        E_Sex: emp.E_Sex || "",
        E_Phno: emp.E_Phno || "",
        E_Jdate: emp.E_Jdate ? moment(emp.E_Jdate) : null,
      });
    } else {
      props.error("Failed to load employee details.");
    }
    props.setLoading(false);
  };

  const submitUpdateEmployee = async (body) => {
    props.setLoading(true);

    const response = await updateEmployee(employeeId, body, onFailure);

    if (response) {
      navigate(-1);
      props.success("Employee Record Updated");
    }

    props.setLoading(false);
  };

  const onFailure = (message) => {
    props.error(message);
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  if (!initialValues) {
    return null;
  }

  return (
    <div style={{ padding: "30px 50px" }}>
      <div
        style={{
          background: "#f1f1f1",
          padding: "30px 40px",
          borderRadius: "8px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            background: "#e0e0e0",
            padding: "10px",
            color: "#0a3a66",
            textTransform: "uppercase",
            borderRadius: "4px",
          }}
        >
          Update Employee Details
        </Title>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            await submitUpdateEmployee(values);
            setSubmitting(false);
          }}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginTop: "30px" }}
            >
              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    validateStatus={
                      touched.E_Fname && errors.E_Fname ? "error" : ""
                    }
                    help={touched.E_Fname && errors.E_Fname}
                    {...formItemLayout}
                  >
                    <Input
                      name="E_Fname"
                      value={values.E_Fname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    validateStatus={
                      touched.E_Lname && errors.E_Lname ? "error" : ""
                    }
                    help={touched.E_Lname && errors.E_Lname}
                    {...formItemLayout}
                  >
                    <Input
                      name="E_Lname"
                      value={values.E_Lname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Sex"
                    validateStatus={
                      touched.E_Sex && errors.E_Sex ? "error" : ""
                    }
                    help={touched.E_Sex && errors.E_Sex}
                    {...formItemLayout}
                  >
                    <Select
                      name="E_Sex"
                      value={values.E_Sex}
                      onChange={(value) => setFieldValue("E_Sex", value)}
                      onBlur={handleBlur}
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Phone"
                    validateStatus={
                      touched.E_Phno && errors.E_Phno ? "error" : ""
                    }
                    help={touched.E_Phno && errors.E_Phno}
                    {...formItemLayout}
                  >
                    <Input
                      name="E_Phno"
                      value={values.E_Phno}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>
                </Col>

                {/* <Col span={12}>
                  <Form.Item
                    label="Join Date"
                    validateStatus={
                      touched.E_date && errors.E_date ? "error" : ""
                    }
                    help={touched.E_date && errors.E_date}
                    {...formItemLayout}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.E_date ? moment(values.E_date) : null}
                      onChange={(date) => setFieldValue("E_Jdate", date)}
                    />
                  </Form.Item>
                </Col> */}
              </Row>

              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ padding: "6px 30px", backgroundColor: "#0070a4" }}
                >
                  {isSubmitting ? "Updating..." : "Update Employee"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default WithMessages(WithLoader(UpdateEmployee));
