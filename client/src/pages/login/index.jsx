import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Card, Input, Button, Typography } from "antd";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, Employeelogin } from "../../redux/slices/authSlice";
import { v4 as uuidv4 } from "uuid";
import "./login.css"
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const LoginForm = ({ role, onSwitch, onSubmit }) => {
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, values }) => (
        <Form>
          <Title level={3} className="login-title">
            {role} Login
          </Title>

          <Field name="username">
            {() => (
              <Input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                className="login-input"
              />
            )}
          </Field>
          <ErrorMessage name="username" component="div" className="error" />

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

          <Button
            type="primary"
            htmlType="submit"
            block
            className="login-button"
          >
            Submit
          </Button>

          <Button type="link" onClick={onSwitch} block>
            Click here for {role === "Admin" ? "Employee" : "Admin"} Login
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const LoginPage = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState("Admin");

  const handleLogin = async (values) => {
    props.setLoading(true);
    switch (role) {
      case "Admin":
        await dispatch(
          login({
            A_ID: uuidv4(),
            A_Username: values?.username,
            A_Password: values?.password,
          })
        );
        break;
      case "Employee":
        await dispatch(
          Employeelogin({
            E_Username: values?.username,
            E_Password: values?.password,
          })
        );
        break     
    }

    props.setLoading(false);
    navigate("/");
  };

  return (
    <div className="login-wrapper">
      <div className="login-header">
        <Title className="main-title">Rashid Pharmacy</Title>
        <p className="sub-title">Pharmacy Management System</p>
      </div>

      <div className="login-center-card">
        <Card className="login-card">
          <LoginForm
            role={role}
            onSwitSubmitch={() => setRole(role === "Admin" ? "Employee" : "Admin")}
            onSubmit={handleLogin}
          />
        </Card>
      </div>

      <div className="login-footer">developed by <a style={{color:"white"}} target="_blank" href="https://github.com/GeekkyCoder">Faraz</a> </div>
    </div>
  );
};

export default WithMessages(WithLoader(LoginPage));
