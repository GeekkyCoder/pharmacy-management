import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Card, Input, Button, Typography } from "antd";
import * as Yup from "yup";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "./signup.css";

const { Title, Text } = Typography;

const SignupSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be less than 50 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
});

const SignupForm = ({ onSubmit, loading }) => {

    const navigate = useNavigate();


  return (
    <Formik
      initialValues={{ userName: "", email: "", password: "" }}
      validationSchema={SignupSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, values, isSubmitting }) => (
        <Form>
          <Title level={3} className="signup-title">
            Create New Admin Account
          </Title>

          <Text className="signup-subtitle">
            Only administrators can create new admin accounts
          </Text>

          <div className="form-field">
            <Field name="userName">
              {() => (
                <Input
                  name="userName"
                  type="text"
                  placeholder="Enter username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.userName}
                  className="signup-input"
                  size="large"
                />
              )}
            </Field>
            <ErrorMessage name="userName" component="div" className="error" />
          </div>

          <div className="form-field">
            <Field name="email">
              {() => (
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className="signup-input"
                  size="large"
                />
              )}
            </Field>
            <ErrorMessage name="email" component="div" className="error" />
          </div>

          <div className="form-field">
            <Field name="password">
              {() => (
                <Input.Password
                  name="password"
                  placeholder="Enter password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className="signup-input"
                  size="large"
                />
              )}
            </Field>
            <ErrorMessage name="password" component="div" className="error" />
          </div>

          <div className="password-requirements">
            <Text type="secondary" className="requirements-text">
              Password requirements:
              <ul>
                <li>At least 6 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </Text>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            className="signup-button"
            size="large"
            loading={loading || isSubmitting}
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Creating Account..." : "Create Admin Account"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const SignupPage = (props) => {
  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    props.setLoading(true);

    try {

      const signupData = {
        ...values,
        role: "admin"
      };

      const response = await axios.post("/user/signup", signupData);

      if (response.data) {
        props.success("Admin account created successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.msg || 
                          "Failed to create admin account";
      props.error(errorMessage);
    } finally {
      props.setLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-header">
        <Title className="main-title">Pharmacy Management System</Title>
        <Text className="sub-title">Admin Registration</Text>
      </div>

      <div className="signup-center-card">
        <Card className="signup-card">
          <SignupForm onSubmit={handleSignup} loading={props.loading} />
          
          <div className="signup-actions">
            <Button 
              type="default" 
              onClick={handleCancel}
              className="cancel-button"
              size="large"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>

      <div className="signup-footer">
        Developed by{" "}
        <a
          style={{ color: "white" }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/GeekkyCoder"
        >
          Faraz
        </a>
      </div>
    </div>
  );
};

export default WithMessages(WithLoader(SignupPage));
