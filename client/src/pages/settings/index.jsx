import React, { useState, useEffect } from "react";
import "./settings.css";
import {
  Steps,
  Card,
  Button,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Modal,
  // message,
  Tabs,
  Row,
  Col,
  Space,
  Tag,
  Popconfirm,
  Divider,
  TimePicker,
  Upload,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentageOutlined,
  ShopOutlined,
  SettingOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  BankOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import moment from "moment";
import apiCall from "../../api/axios";
import {
  discountAPI,
  pharmacyAPI,
  medicineAPI,
  formatDiscountData,
  formatPharmacyData,
  transformDiscountForDisplay,
  transformPharmacyForDisplay,
  MEDICINE_CATEGORIES,
  PHARMACY_SERVICES,
} from "./apiCalls";
import WithMessages from "../../hocs/messages";

const { Step } = Steps;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Settings = (props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Discount Management State
  const [discounts, setDiscounts] = useState([]);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm] = Form.useForm();
  const [medicines, setMedicines] = useState([]);

  // Pharmacy Management State
  const [pharmacyInfo, setPharmacyInfo] = useState(null);
  const [pharmacyModalVisible, setPharmacyModalVisible] = useState(false);
  const [pharmacyForm] = Form.useForm();

  useEffect(() => {
    fetchDiscounts();
    fetchMedicines();
    fetchPharmacyInfo();
  }, []);

  // API Calls
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await discountAPI.getAll();
      if (response.data.success) {
        setDiscounts(response.data.data);
      }
    } catch (error) {
      props.error(error?.response?.data?.message || "Something Went Wrong...");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await medicineAPI.getAll();
      if (response.data.success) {
        setMedicines(response.data.data);
      }
    } catch (error) {
      props.error(error?.response?.data?.message || "Something Went Wrong...");
    }
  };

  const fetchPharmacyInfo = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.get();
      if (response.data.success) {
        const transformedData = transformPharmacyForDisplay(response.data.data);
        setPharmacyInfo(response.data.data);
        pharmacyForm.setFieldsValue(transformedData);
      }
    } catch (error) {
      props.error(error?.response?.data?.message || "Something Went Wrong...");
    } finally {
      setLoading(false);
    }
  };

  // Discount Management Functions
  const handleDiscountSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = formatDiscountData(values);

      if (editingDiscount) {
        await discountAPI.update(editingDiscount._id, formattedValues);
        props.success("Discount updated successfully");
      } else {
        await discountAPI.create(formattedValues);
        props.success("Discount created successfully");
      }

      setDiscountModalVisible(false);
      setEditingDiscount(null);
      discountForm.resetFields();
      fetchDiscounts();
    } catch (error) {
      console.log("err", error);
      props.error(error.response?.data?.message || "Failed to save discount");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    try {
      await discountAPI.delete(id);
      message.success("Discount deleted successfully");
      fetchDiscounts();
    } catch (error) {
      props.error("Failed to delete discount");
    }
  };

  const handleToggleDiscountStatus = async (id) => {
    try {
      await discountAPI.toggleStatus(id);
      message.success("Discount status updated");
      fetchDiscounts();
    } catch (error) {
      props.error("Failed to update discount status");
    }
  };

  // Pharmacy Management Functions
  const handlePharmacySubmit = async (values) => {
    try {
      setLoading(true);
      const formattedValues = formatPharmacyData(values);

      if (pharmacyInfo) {
        await pharmacyAPI.update(formattedValues);
        message.success("Pharmacy information updated successfully");
      } else {
        await pharmacyAPI.create(formattedValues);
        message.success("Pharmacy information created successfully");
      }

      setPharmacyModalVisible(false);
      fetchPharmacyInfo();
    } catch (error) {
      props.error(
        error.response?.data?.message || "Failed to save pharmacy information"
      );
    } finally {
      setLoading(false);
    }
  };

  // Discount Table Columns
  const discountColumns = [
    {
      title: "Name",
      dataIndex: "discountName",
      key: "discountName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (
        <Tag color={type === "percentage" ? "blue" : "green"}>
          {type === "percentage" ? "Percentage" : "Fixed Amount"}
        </Tag>
      ),
    },
    {
      title: "Value",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) => (
        <Text>
          {record.discountType === "percentage" ? `${value}%` : `PKR ${value}`}
        </Text>
      ),
    },
    {
      title: "Valid Period",
      key: "validPeriod",
      render: (_, record) => (
        <div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {moment(record.validFrom).format("MMM DD")} -{" "}
            {moment(record.validUntil).format("MMM DD, YYYY")}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => (
        <Text>
          {record.usageCount || 0}
          {record.usageLimit ? `/${record.usageLimit}` : ""}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setEditingDiscount(record);
              discountForm.setFieldsValue({
                ...record,
                validDates: [
                  moment(record.validFrom),
                  moment(record.validUntil),
                ],
                applicableMedicines: record.applicableMedicines?.map(
                  (med) => med._id
                ),
              });
              setDiscountModalVisible(true);
            }}
          />
          <Button
            icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            size="small"
            onClick={() => handleToggleDiscountStatus(record._id)}
            type={record.isActive ? "default" : "primary"}
          />
          <Popconfirm
            title="Are you sure you want to delete this discount?"
            onConfirm={() => handleDeleteDiscount(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Business Hours Component
  const BusinessHours = ({ form }) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    return (
      <div>
        <Title level={5}>Business Hours</Title>
        {days.map((day) => (
          <Row key={day} gutter={16} style={{ marginBottom: 8 }}>
            <Col span={4}>
              <Text style={{ textTransform: "capitalize", fontWeight: 500 }}>
                {day}
              </Text>
            </Col>
            <Col span={6}>
              <Form.Item name={["businessHours", day, "open"]} noStyle>
                <TimePicker
                  format="HH:mm"
                  placeholder="Open"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={["businessHours", day, "close"]} noStyle>
                <TimePicker
                  format="HH:mm"
                  placeholder="Close"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["businessHours", day, "isClosed"]}
                valuePropName="checked"
                noStyle
              >
                <Switch checkedChildren="Closed" unCheckedChildren="Open" />
              </Form.Item>
            </Col>
          </Row>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            Settings & Management
          </Title>
          <Text type="secondary">
            Manage your pharmacy discounts and business information
          </Text>
        </div>

        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          style={{ marginBottom: 24 }}
        >
          <Step
            title="Discount Management"
            icon={<PercentageOutlined />}
            description="Create and manage discounts"
          />
          <Step
            title="Pharmacy Information"
            icon={<ShopOutlined />}
            description="Business details and settings"
          />
        </Steps>
      </Card>

      {/* Discount Management */}
      {currentStep === 0 && (
        <Card
          title={
            <Space>
              <PercentageOutlined style={{ color: "#1890ff" }} />
              <span>Discount Management</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingDiscount(null);
                discountForm.resetFields();
                setDiscountModalVisible(true);
              }}
            >
              Add Discount
            </Button>
          }
        >
          <Table
            columns={discountColumns}
            dataSource={discounts}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Pharmacy Information */}
      {currentStep === 1 && (
        <Card
          title={
            <Space>
              <ShopOutlined style={{ color: "#1890ff" }} />
              <span>Pharmacy Information</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={pharmacyInfo ? <EditOutlined /> : <PlusOutlined />}
              onClick={() => setPharmacyModalVisible(true)}
            >
              {pharmacyInfo ? "Edit Information" : "Add Information"}
            </Button>
          }
        >
          {pharmacyInfo ? (
            <Row gutter={24}>
              <Col span={12}>
                <Card
                  size="small"
                  title={
                    <>
                      <ShopOutlined /> Basic Information
                    </>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <p>
                    <Text strong>Pharmacy Name:</Text>{" "}
                    {pharmacyInfo.pharmacyName}
                  </p>
                  <p>
                    <Text strong>Owner:</Text> {pharmacyInfo.ownerName}
                  </p>
                  <p>
                    <Text strong>Status:</Text>
                    <Tag
                      color={pharmacyInfo.isActive ? "success" : "default"}
                      style={{ marginLeft: 8 }}
                    >
                      {pharmacyInfo.isActive ? "Active" : "Inactive"}
                    </Tag>
                  </p>
                </Card>

                <Card
                  size="small"
                  title={
                    <>
                      <PhoneOutlined /> Contact Information
                    </>
                  }
                >
                  <p>
                    <Text strong>Phone:</Text> {pharmacyInfo.contactInfo?.phone}
                  </p>
                  <p>
                    <Text strong>Email:</Text> {pharmacyInfo.contactInfo?.email}
                  </p>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small" title="Address" style={{ marginBottom: 16 }}>
                  <p>{pharmacyInfo.address?.street}</p>
                  <p>
                    {pharmacyInfo.address?.city}, {pharmacyInfo.address?.state}
                  </p>
                  <p> 
                    {pharmacyInfo.address?.country}
                  </p>
                </Card>
              </Col>
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <ShopOutlined
                style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No pharmacy information found
              </Title>
              <Text type="secondary">
                Set up your pharmacy details to get started
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Discount Modal */}
      <Modal
        title={editingDiscount ? "Edit Discount" : "Create New Discount"}
        open={discountModalVisible}
        onCancel={() => {
          setDiscountModalVisible(false);
          setEditingDiscount(null);
          discountForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={discountForm}
          layout="vertical"
          onFinish={handleDiscountSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountName"
                label="Discount Name"
                rules={[
                  { required: true, message: "Please enter discount name" },
                ]}
              >
                <Input placeholder="e.g., Senior Citizen Discount" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Discount Type"
                rules={[
                  { required: true, message: "Please select discount type" },
                ]}
              >
                <Select placeholder="Select type">
                  <Option value="percentage">Percentage</Option>
                  <Option value="fixed">Fixed Amount</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discountValue"
                label="Discount Value"
                rules={[
                  { required: true, message: "Please enter discount value" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter value"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minimumAmount" label="Minimum Amount">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Minimum purchase"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maximumDiscount" label="Maximum Discount">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Max discount cap"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="validDates"
            label="Valid Period"
            rules={[{ required: true, message: "Please select valid period" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicableMedicines"
                label="Applicable Medicines"
              >
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Select medicines to apply discount"
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    console.log("fssfs", option);
                    return option?.children
                      ?.toLowerCase()
                      .includes(input.value?.toLowerCase());
                  }}
                  style={{ width: "100%" }}
                >
                  {medicines.map((medicine) => (
                    <Option key={medicine._id} value={medicine.id}>
                      {medicine.Med_Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Usage Limit">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Leave empty for unlimited"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter discount description" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setDiscountModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDiscount ? "Update" : "Create"} Discount
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Pharmacy Info Modal */}
      <Modal
        title={
          pharmacyInfo
            ? "Edit Pharmacy Information"
            : "Setup Pharmacy Information"
        }
        open={pharmacyModalVisible}
        onCancel={() => setPharmacyModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={pharmacyForm}
          layout="vertical"
          onFinish={handlePharmacySubmit}
        >
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <>
                  <FileTextOutlined /> Basic Info
                </>
              }
              key="1"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="pharmacyName"
                    label="Pharmacy Name"
                    rules={[
                      { required: true, message: "Please enter pharmacy name" },
                    ]}
                  >
                    <Input placeholder="e.g., HealthCare Plus Pharmacy" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ownerName"
                    label="Owner Name"
                    rules={[
                      { required: true, message: "Please enter owner name" },
                    ]}
                  >
                    <Input placeholder="e.g., Dr. Muhammad Ahmed" />
                  </Form.Item>
                </Col>
              </Row>


              <Form.Item name="description" label="Description">
                <TextArea
                  rows={3}
                  placeholder="Brief description of your pharmacy"
                />
              </Form.Item>

              <Form.Item name="services" label="Services Offered">
                <Select
                  mode="tags"
                  placeholder="Add services (e.g., Prescription Medicines, Health Consultations)"
                  options={PHARMACY_SERVICES.map((service) => ({
                    value: service,
                    label: service,
                  }))}
                />
              </Form.Item>
            </TabPane>

            <TabPane
              tab={
                <>
                  <GlobalOutlined /> Address & Contact
                </>
              }
              key="2"
            >
              <Title level={5}>Address</Title>
              <Form.Item
                name={["address", "street"]}
                label="Street Address"
                rules={[
                  { required: true, message: "Please enter street address" },
                ]}
              >
                <Input placeholder="123 Main Street, Block A" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={["address", "city"]}
                    label="City"
                    rules={[{ required: true, message: "Please enter city" }]}
                  >
                    <Input placeholder="Karachi" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={["address", "state"]}
                    label="State/Province"
                    rules={[{ required: true, message: "Please enter state" }]}
                  >
                    <Input placeholder="Sindh" />
                  </Form.Item>
                </Col>

              <Col span={8}>
              
              <Form.Item name={["address", "country"]} label="Country">
                <Input placeholder="Pakistan" defaultValue="Pakistan" />
              </Form.Item>
              
              </Col>  
                
              </Row>


              <Divider />

              <Title level={5}>Contact Information</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={["contactInfo", "phone"]}
                    label="Phone"
                    rules={[
                      { required: true, message: "Please enter phone number" },
                    ]}
                  >
                    <Input placeholder="+92-21-1234567" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["contactInfo", "email"]}
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter email" },
                      { type: "email", message: "Please enter valid email" },
                    ]}
                  >
                    <Input placeholder="info@pharmacy.com" />
                  </Form.Item>
                </Col>
              </Row>

              
            </TabPane>

            <TabPane
              tab={
                <>
                  <ClockCircleOutlined /> Business Hours
                </>
              }
              key="3"
            >
              <BusinessHours form={pharmacyForm} />
            </TabPane>
          </Tabs>

          <Form.Item
            style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}
          >
            <Space>
              <Button onClick={() => setPharmacyModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {pharmacyInfo ? "Update" : "Save"} Information
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WithMessages(Settings);
