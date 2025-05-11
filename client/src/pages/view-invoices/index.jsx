import React, { useEffect, useState } from "react";
import { Table, Typography, Input, Space } from "antd";
import dayjs from "dayjs";

import axios from "axios";

const { Title } = Typography;
const { Search } = Input;

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchInvoices = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/invoice/getAllInvoices",
        {
          params: { page, limit, search },
        }
      );

      const { data, total, page: current, limit: pageSize } = response.data;

      setInvoices(data);
      setPagination({ current, pageSize, total });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(pagination.current, pagination.pageSize, search);
  }, []);

  const handleTableChange = (pagination) => {
    fetchInvoices(pagination.current, pagination.pageSize, search);
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchInvoices(1, pagination.pageSize, value);
  };

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      key: "invoiceId",
    },
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
      title: "No. of Items",
      dataIndex: "No_Of_Items",
      key: "No_Of_Items",
    },
    {
      title: "Sale Performed By",
      dataIndex: ["employee"],
      key: "employee",
      render: (employee) => (employee ? `${employee.E_Username}` : "N/A"),
    },
    {
      title: "Invoice Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) =>
        dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A"),
    },
  ];

  const expandedRowRender = (record) => {
    const medColumns = [
      { title: "Medicine Name", dataIndex: "Med_Name", key: "Med_Name" },
      { title: "Quantity", dataIndex: "Med_Qty", key: "Med_Qty" },
      { title: "Price", dataIndex: "Med_Price", key: "Med_Price" },
    ];
    return (
      <Table
        columns={medColumns}
        dataSource={record.items}
        rowKey={(item, idx) => idx}
        pagination={false}
      />
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Invoices</Title>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search by customer name"
            allowClear
            enterButton
            onSearch={handleSearch}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="_id"
        expandable={{ expandedRowRender }}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ViewInvoices;
