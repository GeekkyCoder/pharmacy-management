import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Input,
  Button,
  Row,
  Col,
  Typography,
  Form,
  message,
} from "antd";
import { createEmployee } from "./apiCalls";
import { useSelector } from "react-redux";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";

const { Title } = Typography;

const AddEmployee = (props) => {
  const user = useSelector((state) => state.auth.user);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .required("First name is required"),
    lastName: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  const submitCreateEmployee = async (body, resetForm) => {
    props.setLoading(true);
    const reqBody = {
      userName: `${body?.firstName} ${body?.lastName}`,
      ...body,
    };
    
    try {
      const response = await createEmployee(reqBody);

      if (response?.success) {
        props.success(response.message);
        resetForm();
      } else {
        props.error(response?.message || "Failed to create employee");
      }
    } catch (error) {
      console.error("Error in submitCreateEmployee:", error);
      props.error("An unexpected error occurred. Please try again.");
    } finally {
      props.setLoading(false);
    }
  };

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
          Add Employee Details
        </Title>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setSubmitting(true);
            await submitCreateEmployee(values, resetForm);
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
            dirty
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
                      touched.firstName && errors.firstName ? "error" : ""
                    }
                    help={touched.firstName && errors.firstName}
                    {...formItemLayout}
                  >
                    <Input
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter first name"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    validateStatus={
                      touched.lastName && errors.lastName ? "error" : ""
                    }
                    help={touched.lastName && errors.lastName}
                    {...formItemLayout}
                  >
                    <Input
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter last name"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Email"
                    validateStatus={
                      touched.email && errors.email ? "error" : ""
                    }
                    help={touched.email && errors.email}
                    {...formItemLayout}
                  >
                    <Input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter email address"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Password"
                    validateStatus={
                      touched.password && errors.password ? "error" : ""
                    }
                    help={touched.password && errors.password}
                    {...formItemLayout}
                  >
                    <Input.Password
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter password"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  disabled={!dirty || isSubmitting}
                  htmlType="submit"
                  style={{ padding: "6px 30px", backgroundColor: "#0070a4" }}
                >
                  {isSubmitting ? "Loading..." : "Add Employee"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default WithMessages(WithLoader(AddEmployee));
