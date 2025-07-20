import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Typography } from "antd";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { deleteEmployee, getAllEmployees } from "./apiCalls";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ManageEmployees = (props) => {
  const navigate = useNavigate();

  const [dataSource, setDataSource] = useState([]);

  const onSuccessDeleteEmployee = (message) => {
    props.success(message);
  };

  const onFailureDeleteEmployee = (message) => {
    props.error(message);
  };

  const handleDelete = async (employeeId) => {
    const response = await deleteEmployee(
      employeeId,
      onSuccessDeleteEmployee,
      onFailureDeleteEmployee
    );

    if (response) {
      props.setLoading(true);
      await getAllEmployees(onSuccess, onFailure);
      props.setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      navigate(`/update-employee/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  const onSuccess = (data) => {
    setDataSource(data);
  };

  const onFailure = (message) => {
    props.error(JSON.stringify(message));
    // setDataSource([]);
  };

  const columns = [
    { title: "Employee", dataIndex: "userName" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    {
      title: "Actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            onClick={() => handleEdit(record._id)}
            style={{ flex: 1 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type="dashed"
              style={{ flex: 1, backgroundColor: "red", color: "white" }}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      props.setLoading(true);
      await getAllEmployees(onSuccess, onFailure);
      props.setLoading(false);
    })();
  }, []);

  return (
    <div style={{ padding: "30px 50px" }}>
      <div
        style={{
          // background: "#f1f1f1",
          padding: "30px 40px",
          borderRadius: "8px",
          // maxWidth: 1000,
          // margin: "0 auto",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            background: "#e0e0e0",
            padding: "10px",
            color: "#0a3a66",
            textTransform: "uppercase",
            borderRadius: "4px",
          }}
        >
          Manage Employees
        </Title>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={props.loading}
          style={{ marginTop: "30px" }}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default WithMessages(WithLoader(ManageEmployees));
