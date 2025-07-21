import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Row, Col } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updatePassword, updatePasswordWithOld } from './apiCalls';
import './updatePassword.css';

const { Title, Text } = Typography;

const UpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const token = searchParams.get('token');
  const userType = searchParams.get('type') || 'user';
  
  // Determine if this is a verification scenario (has token) or regular password update
  const isVerification = !!token;
  const isLoggedIn = !!user;

  useEffect(() => {
    // If no token and no logged in user, redirect to login
    if (!token && !user) {
      navigate('/auth/login');
      return;
    }
    
    if (isVerification && !token) {
      setError('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token, user, navigate, isVerification]);

  // Dynamic validation schema based on scenario
  const getValidationSchema = () => {
    const baseSchema = {
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password')
    };

    if (!isVerification && isLoggedIn) {
      // Add old password validation for logged-in users
      baseSchema.oldPassword = Yup.string()
        .required('Current password is required');
    }

    return Yup.object(baseSchema);
  };

  // Dynamic initial values based on scenario
  const getInitialValues = () => {
    const baseValues = {
      newPassword: '',
      confirmPassword: ''
    };

    if (!isVerification && isLoggedIn) {
      baseValues.oldPassword = '';
    }

    return baseValues;
  };

  // Formik setup
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        let response;
        
        if (isVerification) {
          // Verification scenario (with token)
          if (!token) {
            setError('Invalid verification token.');
            return;
          }
          
          response = await updatePassword({
            token,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            userType
          });
          
          setSuccess('Password updated successfully! Your account has been activated.');
          setTimeout(() => {
            navigate('/auth/login');
          }, 2000);
          
        } else {
          // Regular password update scenario (logged-in user)
          console.log('Making password change request with:', {
            userRole: user?.role,
            userType: user?.role === 'admin' ? 'admin' : 'employee',
            hasOldPassword: !!values.oldPassword
          });
          
          response = await updatePasswordWithOld({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            userType: user?.role === 'admin' ? 'admin' : 'employee'
          });
          
          setSuccess('Password updated successfully!');
          setTimeout(() => {
            navigate('/'); 
          }, 2000);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  // Early return for verification scenario with invalid token
  if (isVerification && !token) {
    return (
      <div className="update-password-container">
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={16} md={12} lg={8}>
            <Card className="update-password-card">
              <div className="update-password-header">
                <LockOutlined className="update-password-icon" />
                <Title level={2}>Invalid Link</Title>
                <Text type="secondary">
                  This verification link is invalid or has expired. Please contact your administrator.
                </Text>
              </div>
              <Button 
                type="primary" 
                block 
                onClick={() => navigate('/auth/login')}
                style={{ marginTop: 20 }}
              >
                Go to Login
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Get dynamic content based on scenario
  const getPageContent = () => {
    if (isVerification) {
      return {
        title: "Update Your Password",
        description: "Please set a new password to activate your account and complete the registration process.",
        footer: "Your account will be activated once you successfully update your password."
      };
    } else {
      return {
        title: "Change Password",
        description: "Update your current password for enhanced security.",
        footer: "Choose a strong password that you haven't used before."
      };
    }
  };

  const content = getPageContent();

  return (
    <div className="update-password-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={16} md={12} lg={8}>
          <Card className="update-password-card">
            <div className="update-password-header">
              <LockOutlined className="update-password-icon" />
              <Title level={2}>{content.title}</Title>
              <Text type="secondary">
                {content.description}
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{ marginBottom: 20 }}
              />
            )}

            {success && (
              <Alert
                message={success}
                description={isVerification ? "Redirecting to login page..." : "Redirecting to dashboard..."}
                type="success"
                showIcon
                style={{ marginBottom: 20 }}
              />
            )}

            <Form layout="vertical" onFinish={formik.handleSubmit}>
              {/* Show current password field only for logged-in users (not verification) */}
              {!isVerification && isLoggedIn && (
                <Form.Item
                  label="Current Password"
                  validateStatus={
                    formik.touched.oldPassword && formik.errors.oldPassword ? 'error' : ''
                  }
                  help={
                    formik.touched.oldPassword && formik.errors.oldPassword
                      ? formik.errors.oldPassword
                      : null
                  }
                >
                  <Input.Password
                    name="oldPassword"
                    value={formik.values.oldPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter current password"
                    size="large"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              )}

              <Form.Item
                label="New Password"
                validateStatus={
                  formik.touched.newPassword && formik.errors.newPassword ? 'error' : ''
                }
                help={
                  formik.touched.newPassword && formik.errors.newPassword
                    ? formik.errors.newPassword
                    : null
                }
              >
                <Input.Password
                  name="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter new password"
                  size="large"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                validateStatus={
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''
                }
                help={
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? formik.errors.confirmPassword
                    : null
                }
              >
                <Input.Password
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm new password"
                  size="large"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    disabled={!formik.isValid || success}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                  
                  <Button
                    type="link"
                    block
                    onClick={() => navigate(isVerification ? '/auth/login' : '/')}
                    disabled={loading}
                  >
                    {isVerification ? 'Back to Login' : 'Back to Dashboard'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <div className="update-password-footer">
              <Text type="secondary" style={{ fontSize: 12 }}>
                {content.footer}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UpdatePassword;
