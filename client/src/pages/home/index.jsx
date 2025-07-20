import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Spin,
  Empty,
  Tooltip,
  Drawer,
  List,
  Button,
  Tabs,
  Badge,
} from "antd";

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip as RechartsTooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
import axios from "../../api/axios.js";
import {
  ShoppingCartOutlined,
  WarningOutlined,
  FireOutlined,
  BoxPlotOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import WithLoader from "../../hocs/loader";
import ThemeToggle from "../../components/theme-toogle";
import { useSelector } from "react-redux";
import themes from "../../providers/themeDefinations";
import WithMessages from "../../hocs/messages/index.jsx";

const { Title } = Typography;

const Dashboard = (props) => {
  const { currentTheme } = useSelector((state) => state.theme);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "PKR 0";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/dashboard/summary");
        setData(response.data?.data);
      } catch (error) {
        props.error(error?.response?.data?.message || "Failed to fetch dashboard data");
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "auto" }} />;
  // if (!data) return <Empty description="No dashboard data available" />;

  const {
    adminInfo,
    totalMedicines,
    outOfStock,
    lowStock,
    expired,
    expiringSoon,
    todaysSales,
    topSelling,
    totalStockValue,
    monthlySales,
  } = data || {};
 
  const totalAlerts =
    (outOfStock?.count || 0) + (lowStock?.count || 0) + (expired?.count || 0);

  const fetchSupplierData = async (medName) => {
    try {
      const { data } = await axios.get(
        `/purchase/getSupplierInfoByMedId/${medName}`
      );

      return data?.supplierDetails;
    } catch (error) {
      console.error("Failed to fetch supplier details:", error);
    }
  };

  const handleItemClick = async (med) => {
    props.setLoading(true);

    console;

    const supplierDetails = await fetchSupplierData(med?.Med_Name);

    const medicineData = {
      ...med,
      Sup_Name: supplierDetails?.Sup_Name,
      Sup_Phno: supplierDetails?.Sup_Phno,
    };

    props.setLoading(false);
    navigate("/sale/restock", { state: { medicineData, canAddMore: false } });
  };

  const appTheme = themes[currentTheme];

  console.log('user', user)

  return (
    <>
      {user?.role === "admin" ? (
        <div style={{ padding: 24, position: "relative" }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={3}>Dashboard</Title>
            <Typography.Text type="secondary">
              Welcome back, {adminInfo?.name}! Here's your pharmacy overview.
            </Typography.Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Badge
              count={totalAlerts}
              size="small"
              offset={[0, 6]}
              color={appTheme?.token?.colorPrimary}
            >
              <Button
                icon={<BellOutlined />}
                onClick={() => setDrawerVisible(true)}
                type={totalAlerts > 0 ? "primary" : "default"}
              >
                Notifications
              </Button>
            </Badge>
            <ThemeToggle />
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Medicines"
                  value={totalMedicines}
                  prefix={<BoxPlotOutlined />}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Tooltip
                title={
                  outOfStock?.medicines?.map((m) => m.Med_Name).join(", ") ||
                  "None"
                }
              >
                <Card>
                  <Statistic
                    title="Out of Stock"
                    value={outOfStock?.count || 0}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: appTheme?.token?.colorPrimary }}
                  />
                </Card>
              </Tooltip>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Tooltip
                title={
                  lowStock?.medicines?.map((m) => m.Med_Name).join(", ") ||
                  "None"
                }
              >
                <Card>
                  <Statistic
                    title="Low Stock"
                    value={lowStock?.count || 0}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: appTheme?.token?.colorPrimary }}
                  />
                </Card>
              </Tooltip>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Expired"
                  value={expired?.count || 0}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card title="Today's Sales">
                <Statistic
                  title="Total Sales"
                  value={todaysSales?.count || 0}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
                <Statistic
                  title="Total Revenue"
                  value={formatCurrency(todaysSales?.totalRevenue || 0)}
                  style={{ marginTop: 16 }}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Inventory Value">
                <Statistic
                  title="Total Stock Value"
                  value={formatCurrency(totalStockValue || 0)}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
                <Statistic
                  title="Total Medicines"
                  value={totalMedicines || 0}
                  style={{ marginTop: 16 }}
                  valueStyle={{ color: appTheme?.token?.colorPrimary }}
                />
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Expiring Soon">
                {expiringSoon?.count === 0 ? (
                  <Empty description="No medicines expiring soon" />
                ) : (
                  <ul>
                    {expiringSoon?.medicines?.slice(0, 5).map((med) => (
                      <li
                        key={med._id}
                        style={{ color: appTheme?.token?.colorPrimary }}
                      >
                        {med.Med_Name} -{" "}
                        {new Date(med.Expiry_Date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Top Selling Medicines And Sales Unit">
                {topSelling?.length === 0 ? (
                  <Empty description="No sales data" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {topSelling?.map((item) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={item.Med_Name}>
                        <Card hoverable>
                          <img
                            src={`icons/pill.png`}
                            alt="medicine"
                            style={{
                              width: "22px",
                              objectFit: "cover",
                              borderRadius: 8,
                              filter: `grayscale(50%)`,
                              fill: appTheme?.token?.colorPrimary,
                            }}
                          />
                          <Statistic
                            title={item?.Med_Name}
                            value={item?.totalSold}
                            valueStyle={{
                              color: appTheme?.token?.colorPrimary,
                            }}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </Col>
          </Row>

          <Drawer
            title="Stock Alerts"
            placement="right"
            closable
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={350}
          >
            <Tabs defaultActiveKey="out">
              <Tabs.TabPane
                tab={`Out of Stock (${outOfStock?.count || 0})`}
                key="out"
              >
                <List
                  dataSource={outOfStock?.medicines || []}
                  renderItem={(item) => (
                    <List.Item>
                      <Button
                        type="default"
                        onClick={() => handleItemClick(item)}
                      >
                        {item.Med_Name} - <strong>Out of Stock</strong>
                      </Button>
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Low Stock (${lowStock?.count || 0})`}
                key="low"
              >
                <List
                  dataSource={lowStock?.medicines || []}
                  renderItem={(item) => (
                    <List.Item>
                      <Button
                        type="default"
                        onClick={() => handleItemClick(item)}
                      >
                        {item.Med_Name} - <strong>Qty: {item.Med_Qty}</strong>
                      </Button>
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Expired (${expired?.count || 0})`}
                key="expired"
              >
                <List
                  dataSource={expired?.medicines || []}
                  renderItem={(item) => (
                    <List.Item>
                      <Button
                        type="default"
                        danger
                        onClick={() => handleItemClick(item)}
                      >
                        {item.Med_Name} - <strong>Expired</strong>
                      </Button>
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            </Tabs>
          </Drawer>
        </div>
      ) : (
        <div>Employee hai toh beta</div>
      )}
    </>
  );
};

export default WithMessages(WithLoader(Dashboard));
