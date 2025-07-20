import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Pagination,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { fetchPurchaseData } from "./apiCalls";

const { Title } = Typography;

const ViewSupplierPurchases = (props) => {
  const [data, setData] = useState([]);
  const [page,setPage] = useState(1)
  const [limit,setLimit] = useState(5)
  const [tableData, setTableData] = useState({
    data: [],
    page: 1,
    limit: 5,
    totalRecords: 0,
  });

  const [search, setSearch] = useState("");

  const fetchPurchases = async () => {
    props.setLoading(true);

    const params = {
      Sup_Name: search || "",
      page,
      limit,
    };

    try {
      await fetchPurchaseData(params, onSuccess, onFailure);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      props.setLoading(false);
    }
  };

  const onSuccess = async (options) => {
    setTableData({
      data: options.data,
      limit: options.limit,
      page: options.currentPage,
      totalRecords: options.totalRecords,
    });
  };

  const onFailure = (err) => {
    props.error(err);
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, limit, search]);

  const handleSearch = (value) => {
    setPage(1);
    setSearch(value.trim());
  };

  const columns = [
    {
      title: "Supplier Name",
      dataIndex: "Sup_Name",
      key: "Sup_Name",
    },
    {
      title: "Phone",
      dataIndex: "Sup_Phno",
      key: "Sup_Phno",
    },
    {
      title: "Total Medicines",
      key: "totalMeds",
      render: (_, record) => record.purchases?.length || 0,
    },
    {
      title: "Purchased By (Emp)",
      key: "purchaseMadeBy",
      render: (_, record) =>
        record.purchaseMadeBy?.E_Fname || record.purchaseMadeBy?.E_Lname || "—",
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_, record) =>
        dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A"),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Supplier Purchase Records</Title>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Search by supplier name"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Space>
        </Col>
      </Row>

      <Table
        loading={props.loading}
        columns={columns}
        dataSource={tableData.data}
        rowKey="_id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              {record.purchases?.map((item, idx) => (
                <Card
                  key={idx}
                  size="small"
                  type="inner"
                  title={`#${idx + 1} - ${item.P_Name}`}
                  style={{ marginBottom: 12 }}
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <strong>Qty:</strong> {item.P_Qty}
                    </Col>
                    <Col span={6}>
                      <strong>Cost/unit:</strong> Rs. {item.P_Cost}
                    </Col>
                    <Col span={6}>
                      <strong>Mfg:</strong>{" "}
                      {dayjs(item.Mfg_Date).format("DD/MM/YYYY")}
                    </Col>
                    <Col span={6}>
                      <strong>Exp:</strong>{" "}
                      {dayjs(item.Exp_Date).format("DD/MM/YYYY")}
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <strong>Purchase Date:</strong>{" "}
                      {dayjs(item.Pur_Date).format("DD/MM/YYYY")}
                    </Col>
                    <Col span={12}>
                      <strong>Total Price:</strong> Rs.{" "}
                      {(item.P_Qty * item.P_Cost).toFixed(2)}
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ),
        }}
      />

      <Row justify="end" style={{ marginTop: 24 }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={tableData.totalRecords}
          onChange={(p, l) => {
            setPage(p);
            setLimit(l);
          }}
          showSizeChanger
        />
      </Row>
    </Card>
  );
};

export default WithMessages(WithLoader(ViewSupplierPurchases));
