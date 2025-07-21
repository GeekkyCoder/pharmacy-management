import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Card, Input, Button, Typography, Radio } from "antd";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/slices/authSlice";
import { v4 as uuidv4 } from "uuid";
import "./login.css";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email().required("Email is required"),
  password: Yup.string().required("Password is required"),
  role: Yup.string().required("Role is required"),
});

const LoginForm = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{ email: "", password: "", role: "" }}
      validationSchema={LoginSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, values, setFieldValue }) => (
        <Form>
          <Title level={3} className="login-title">
            Login
          </Title>

          <Field name="email">
            {() => (
              <Input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                className="login-input"
              />
            )}
          </Field>
          <ErrorMessage name="email" component="div" className="error" />

          <Field name="password">
            {() => (
              <Input.Password
                name="password"
                placeholder="Password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                className="login-input"
              />
            )}
          </Field>
          <ErrorMessage name="password" component="div" className="error" />

          <Field name="role">
            {() => (
              <div style={{ marginBottom: "16px", marginTop: "8px" }}>
                <Typography.Text style={{ marginBottom: "8px", display: "block" }}>
                  Select Role:
                </Typography.Text>
                <Radio.Group
                  name="role"
                  value={values.role}
                  onChange={(e) => setFieldValue("role", e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Radio value="admin">Admin</Radio>
                  <Radio value="employee">Employee</Radio>
                </Radio.Group>
              </div>
            )}
          </Field>
          <ErrorMessage name="role" component="div" className="error" />

          <Button
            type="primary"
            htmlType="submit"
            block
            className="login-button"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const LoginPage = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (values) => {
    console.log("Login values:", values);
    props.setLoading(true);

    try {
      const res = await dispatch(
        login({ 
          userEmail: values?.email, 
          userPassword: values?.password,
          role: values?.role
        })
      );
      
      if (login.fulfilled.match(res)) {
        props.success("Login successful!");
        navigate("/");
      } else {
        props.error(res.payload || "Login failed");
      }
    } catch (err) {
      props.error("An unexpected error occurred");
    } finally {
      props.setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-header">
        <Title className="main-title">Pharmacy Management System</Title>
      </div>

      <div className="login-center-card">
        <Card className="login-card">
          <LoginForm onSubmit={handleLogin} />
        </Card>
      </div>

      <div className="login-footer">
        Developed by{" "}
        <a
          style={{ color: "white" }}
          target="_blank"
          href="https://github.com/GeekkyCoder"
        >
          Faraz
        </a>{" "}
      </div>
    </div>
  );
};

export default WithMessages(WithLoader(LoginPage));
