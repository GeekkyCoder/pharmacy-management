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
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    role: Yup.string().nullable(),
    // E_date: Yup.date().required("Join date is required"),
  });

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  const fetchEmployeeDetails = async () => {
    props.setLoading(true);
    try{
    const response = await getEmployeeById(employeeId);
    if (response) {
      const emp = response;
      console.log("emp", emp);
      const firstName = emp?.userName.split(" ")[0] || "";
      const lastName = emp?.userName.split(" ")[1] || "";
      setInitialValues({
        firstName: firstName || "",
        lastName: lastName || "",
        email: emp?.email || "",
        role: emp?.role || "",
      });
    }
    } catch(err) {

    }finally {
      props.setLoading(false);
    }

   
  };

  const submitUpdateEmployee = async (body) => {
    props.setLoading(true);

    const payload  = {
      userName: `${body?.firstName} ${body?.lastName}`,
      email: body?.email,
      role: body?.role,
    }

    const response = await updateEmployee(employeeId, payload, onFailure);

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
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Role"
                    validateStatus={
                      touched.role && errors.role ? "error" : ""
                    }
                    help={touched.role && errors.role}
                    {...formItemLayout}
                  >
                    <Select
                      name="role"
                      value={values.role}
                      onChange={(value) => setFieldValue("role", value)}
                      onBlur={handleBlur}
                    >
                      <Option value="employee">Employee</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Form.Item>
                </Col>
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
