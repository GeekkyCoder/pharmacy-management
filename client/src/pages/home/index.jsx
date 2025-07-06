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
import axios from "../../api/axios.js"
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

const { Title } = Typography;

const Dashboard = (props) => {
  const {currentTheme} = useSelector(state => state.theme)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "/dashboard/summary"
        );
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "auto" }} />;
  if (!data) return <Empty description="No dashboard data available" />;

  const {
    totalMedicines,
    outOfStock,
    lowStock,
    expired,
    expiringSoon,
    todaysSales,
    topSelling,
  } = data;

  const totalAlerts = (outOfStock?.length || 0) + (lowStock?.length || 0);

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
    navigate("/sale/restock", { state: { medicineData,canAddMore:false } });
  };


  const appTheme = themes[currentTheme]

  console.log("themeee", appTheme)

  return (
    <div style={{ padding: 24, position: "relative" }}>
        <Title level={3}>Dashboard</Title>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems:"center" }}>
        <Badge count={totalAlerts} size="small" offset={[0, 6]} color={appTheme?.token?.colorPrimary}>
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
            title={outOfStock?.map((m) => m.Med_Name).join(", ") || "None"}
          >
            <Card>
              <Statistic
                title="Out of Stock"
                value={outOfStock?.length}
                prefix={<WarningOutlined />}
                valueStyle={{ color: appTheme?.token?.colorPrimary }}
              />
            </Card>
          </Tooltip>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Tooltip
            title={lowStock?.map((m) => m.Med_Name).join(", ") || "None"}
          >
            <Card>
              <Statistic
                title="Low Stock"
                value={lowStock?.length}
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
              value={expired?.length}
              prefix={<FireOutlined />}
              valueStyle={{ color: appTheme?.token?.colorPrimary }}

            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Today's Sales">
            <Statistic title="Total Sales" value={todaysSales?.count}
              valueStyle={{ color: appTheme?.token?.colorPrimary }}
            
            />
            <Statistic
              title="Total Revenue"
              value={todaysSales?.totalRevenue}
              prefix="$"
              style={{ marginTop: 16 }}
              valueStyle={{ color: appTheme?.token?.colorPrimary }}

            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Expiring Soon">
            {expiringSoon?.length === 0 ? (
              <Empty description="No medicines expiring soon" />
            ) : (
              <ul>
                {expiringSoon?.slice(0, 5).map((med) => (
            
              <li key={med._id}   style={{ color: appTheme?.token?.colorPrimary}} >
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
          <Card title="Top Selling Medicines">
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
                      <Statistic title={item?.Med_Name} value={item?.totalSold}  
              valueStyle={{ color: appTheme?.token?.colorPrimary }}
                      
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
          <Tabs.TabPane tab={`Out of Stock (${outOfStock?.length})`} key="out">
            <List
              dataSource={outOfStock}
              renderItem={(item) => (
                <List.Item>
                  <Button type="default" onClick={() => handleItemClick(item)}>
                    {item.Med_Name} - <strong>Out of Stock</strong>
                  </Button>
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab={`Low Stock (${lowStock?.length})`} key="low">
            <List
              dataSource={lowStock}
              renderItem={(item) => (
                <List.Item>
                  <Button type="default" onClick={() => handleItemClick(item)}>
                    {item.Med_Name} - <strong>Low Stock</strong>
                  </Button>
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
};

export default WithLoader(Dashboard);
