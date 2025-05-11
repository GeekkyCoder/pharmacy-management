import React, { useEffect, useState } from "react";
import { Table, Input, Button, Typography, Layout } from "antd";
import WithLoader from "../../hocs/loader";
import WithMessages from "../../hocs/messages";
import { getAllMedicines } from "./apiCalls";
import moment from "moment";
import dayjs from "dayjs"
import { useSelector } from "react-redux";
import themes from "../../providers/themeDefinations";

const { Title } = Typography;
const { Content } = Layout;

const MedicineInventory = (props) => {

  const theme = useSelector(state => state.theme)


  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState({
    tableData: [],
    currentPage: 1,
    totalPages: 0,
  });

  const columns = [
    { title: "Medicine ID", dataIndex: "_id", key: "id" },
    { title: "Medicine Name", dataIndex: "Med_Name", key: "name" },
    { title: "Quantity Available", dataIndex: "Med_Qty", key: "quantity" },
    { title: "Price", dataIndex: "Med_Price", key: "price" },
    {
      title: "Purchase Date",
      dataIndex: "Purchase_Date",
      key: "price",
      render: (_, record) =>
      dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A"),
  },
    {
      title: "Mfg Date",
      dataIndex: "Manufacture_Date",
      key: "price",
      render: (text) => (text ? moment(text).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Exp Date",
      dataIndex: "Expiry_Date",
      key: "price",
      render: (text) => (text ? moment(text).format("DD-MM-YYYY") : "-"),
    },
  ];

  const handleSearch = async () => {
    await getMedicines(searchText);
  };

  const getMedicines = async () => {
    props.setLoading(true);
    try {
      const response = await getAllMedicines(onSuccess, onFailure, searchText);

      if (!response) {
        props.error("Could not fetch medicines");
      }
    } catch (err) {
      props.error("Somethint Went Wrong");
    } finally {
      props.setLoading(false);
    }
  };

  const onSuccess = (dtos) => {
    console.log("dttttos", dtos);
    setData((prev) => ({
      ...prev,
      tableData: dtos?.tableData,
      currentPage: dtos?.currentPage,
      totalPages: dtos?.totalPages,
    }));
  };

  const onFailure = (message) => {
    props.error(message);
  };

  useEffect(() => {
    (async () => {
      await getMedicines();
    })();
  }, []);

  console.log(`data`, data);

   const appTheme = themes[theme.currentTheme].token

   console.log('app', appTheme)

  return (
    <Layout
      style={{ padding: "24px", minHeight: "100vh", background: appTheme.colorBgBase
       }}
    >
      <Content style={{ maxWidth: 1100, padding: 24 }}>
        <Title
          level={3}
          style={{
            textAlign: "center",
            backgroundColor: appTheme?.colorBgContainer,
            padding: "10px",
            color: appTheme?.colorPrimary,
            textTransform: "uppercase",
            borderRadius: 4,
          }}
        >
          Medicine Inventory
        </Title>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0",
          }}
        >
          <Input
            placeholder="Enter any value to Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, marginRight: 10 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Submit
          </Button>
        </div>

        <Table
          dataSource={data?.tableData}
          columns={columns}
          bordered
          pagination={{
            pageSize: 10,
            current: data?.currentPage,
            total: data?.totalPages,
          }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Content>
    </Layout>
  );
};

export default WithMessages(WithLoader(MedicineInventory));
