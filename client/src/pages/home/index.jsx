// src/pages/Home.js
import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const actions = [
  { title: 'Add New Medicine', img: '/icons/carticon1.png', route: '/add-medicine' },
  { title: 'Manage Inventory', img: '/icons/inventory.png', route: '/manage-inventory' },
  { title: 'Employee Records', img: '/icons/emp.png', route: '/employees' },
  { title: 'Cash Flow', img: '/icons/moneyicon.png', route: '/cash-flow' },
  { title: 'Alerts / Warnings', img: '/icons/alert.png', route: '/alerts' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
        ADMIN DASHBOARD
      </Title>
      <Row gutter={[24, 24]} justify="center">
        {actions.map((action, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', border: '1px solid #eee' }}
              cover={
                <img
                  alt={action.title}
                  src={action.img}
                  style={{ height: 150, objectFit: 'contain', padding: 20 }}
                />
              }
              onClick={() => navigate(action.route)}
            >
              <Title level={5}>{action.title}</Title>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Home;
