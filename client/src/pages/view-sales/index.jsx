import React, { useEffect, useState } from "react";
import { Table, Typography, Input, Space } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { Search } = Input;

const ViewSales = () => {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSales = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/sale/getAllSales",
        {
          params: { page, limit, search },
        }
      );

      const { data, total, page: current, limit: pageSize } = response.data;

      setSales(data);
      setPagination({ current, pageSize, total });
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(pagination.current, pagination.pageSize, search);
  }, []);

  const handleTableChange = (pagination) => {
    fetchSales(pagination.current, pagination.pageSize, search);
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchSales(1, pagination.pageSize, value);
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "C_Name",
      key: "C_Name",
    },
    {
      title: "Customer ID",
      dataIndex: "C_ID",
      key: "C_ID",
    },
    {
      title: "Total Price",
      dataIndex: "Total_Price",
      key: "Total_Price",
      render: (price) => `Rs. ${price?.toFixed(2)}`,
    },
    {
      title: "Sale Performed By",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (emp) => (emp ? `${emp.E_Username}` : "N/A"),
    },
    {
      title: "Sale Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) =>
        dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A"),
    },
  ];

  const expandedRowRender = (record) => {
    const medColumns = [
      {
        title: "Medicine Name",
        dataIndex: ["Med_ID", "Med_Name"],
        key: "Med_Name",
        render: (_, med) => med?.Med_ID?.Med_Name || "N/A",
      },
      {
        title: "Quantity Sold",
        dataIndex: "Sale_Qty",
        key: "Sale_Qty",
      },
      {
        title: "Price Per Unit",
        dataIndex: ["Med_ID", "Med_Price"],
        key: "Med_Price",
        render: (_, med) =>
          `Rs. ${med?.Med_ID?.Med_Price?.toFixed(2) || "0.00"}`,
      },
      {
        title: "Total Price",
        key: "TotalPrice",
        render: (_, med) => {
          const price = med?.Med_ID?.Med_Price || 0;
          const qty = med?.Sale_Qty || 0;
          return `Rs. ${(price * qty).toFixed(2)}`;
        },
      },
    ];

    return (
      <div>
        <Table
          columns={medColumns}
          dataSource={record.medicines}
          rowKey={(med, index) => med._id || med?.Med_ID?._id || index}
          pagination={false}
        //   size="small"
        />
      </div>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Sales</Title>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by customer name"
          allowClear
          enterButton
          onSearch={handleSearch}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={sales}
        rowKey="_id"
        expandable={{ expandedRowRender }}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ViewSales;
