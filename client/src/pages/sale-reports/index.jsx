import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Button, DatePicker, Typography, Table } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as Yup from "yup";
import moment from "moment";
import * as XLSX from "xlsx";
import WithMessage from "../../hocs/messages";
import { salesReport } from "./apiCalls";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const ReportSchema = Yup.object().shape({
  dateRange: Yup.array()
    .of(Yup.date().required())
    .length(2, "Please select a start and end date")
    .required("Date range is required")
    .test(
      "max-6-months",
      "Date range must not exceed 6 months",
      function (value) {
        if (!value || value.length !== 2) return false;
        const [start, end] = value;
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
        return end - start <= sixMonthsInMs;
      }
    ),
});

function Index(props) {
  const [tableData, setTableData] = useState({
    loading: false,
    currentPage: 1,
    totalPages: 0,
    totalDocsLength: 0,
    data: [],
  });

  const handleSubmit = async (values) => {
    const [start, end] = values.dateRange;

    const payload = {
      page: tableData?.currentPage || 1,
      startDate: moment(new Date(start)).format("YYYY-MM-DD"),
      endDate: moment(new Date(end)).format("YYYY-MM-DD"),
    };

    await getSalesReport(payload);
  };

  const getSalesReport = async (values) => {
    const payload = {
      page: values?.page || 1,
      startDate: values?.startDate,
      endDate: values?.endDate,
    };

    setTableData((prev) => ({ ...prev, loading: true }));
    await salesReport(payload, onSuccess, onFailure);
  };

  const exportToExcel = () => {
    if (!tableData.data || tableData.data.length === 0) {
      props.error("No data available to export");
      return;
    }

    // Prepare main sales data
    const salesData = tableData.data.map((record, index) => ({
      "S.No": index + 1,
      "Customer ID": record.C_ID || "N/A",
      "Customer Name": record.C_Name || "N/A",
      "Total Amount (PKR)": record.Total_Price || 0,
      "Sale Performed By": record.employeeId ? `${record.employeeId.userName} (${record.employeeId.role})` : "N/A",
      "Sale Date": moment(record.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      "Number of Items": record.NO_Of_Items || 0,
    }));

    // Prepare detailed medicines data
    const medicinesData = [];
    tableData.data.forEach((record) => {
      if (record.medicines && record.medicines.length > 0) {
        record.medicines.forEach((med) => {
          medicinesData.push({
            "Customer ID": record.C_ID || "N/A",
            "Customer Name": record.C_Name || "N/A",
            "Medicine Name": med.Med_ID?.Med_Name || "N/A",
            "Medicine Price (PKR)": med.Med_ID?.Med_Price || 0,
            "Quantity Sold": med.Sale_Qty || 0,
            "Total Value (PKR)": (med.Med_ID?.Med_Price || 0) * (med.Sale_Qty || 0),
            "Purchase Date": med.Med_ID?.Purchase_Date ? moment(med.Med_ID.Purchase_Date).format("YYYY-MM-DD") : "N/A",
            "Sale Date": moment(record.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          });
        });
      }
    });

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add sales summary sheet
    const ws1 = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, ws1, "Sales Summary");
    
    // Add detailed medicines sheet
    if (medicinesData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(medicinesData);
      XLSX.utils.book_append_sheet(wb, ws2, "Medicine Details");
    }

    // Generate filename with date range
    const startDate = salesData.length > 0 ? moment(tableData.data[tableData.data.length - 1].createdAt).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    const endDate = salesData.length > 0 ? moment(tableData.data[0].createdAt).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    const filename = `Sales_Report_${startDate}_to_${endDate}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
    props.success(`Excel file downloaded: ${filename}`);
  };

  const onSuccess = (options) => {
    // props.success(options.message);
    const data = options.data;
    setTableData({
      loading: false,
      currentPage: options.page,
      totalPages: options?.totalPages,
      totalDocsLength: options?.totalDocsLength,
      data: data.docs,
    });
  };

  const onFailure = (message) => {
    setTableData((prev) => ({ ...prev, loading: false }));
    props.error(message);
  };

  useEffect(() => {
    (async () => {
      await getSalesReport({
        page: 1,
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
      });
    })();
  }, []);

  const columns = [
    {
      title: "Customer ID",
      dataIndex: "C_ID",
      key: "C_ID",
    },
    {
      title: "Customer Name",
      dataIndex: "C_Name",
      key: "C_NAME",
    },
    {
      title: "Total Amount",
      dataIndex: "Total_Price",
      key: "Total_Price",
    },
    {
      title: "Sale Performed By",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (emp) => (emp ? `${emp.userName} (${emp?.role})` : "N/A"),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
  ];

  const expandedRowRender = (record) => {
    console.log("record", record);

    const medicinesData = record.medicines?.map((med) => {
      return {
        Med_Name: med?.Med_ID?.Med_Name,
        Med_Price: med?.Med_ID?.Med_Price,
        Tot_Price: med?.Med_ID?.Total_Price,
        Purchase_Date: med?.Med_ID?.Purchase_Date,
        Total_Sale_Qty: med?.Sale_Qty,
      };
    });

    const columns = [
      { title: "Medicine Name", dataIndex: "Med_Name", key: "Med_Name" },
      { title: "Price", dataIndex: "Med_Price", key: "Med_Price" },
      {
        title: "Total Items Bought",
        dataIndex: "Total_Sale_Qty",
        key: "Total_Sale_Qty",
      },
      {
        title: "Purchase Date",
        dataIndex: "Purchase_Date",
        key: "Purchase_Date",
        render: (original) => {
          return <span>{moment(original).format("YYYY-MM-DD")}</span>;
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={medicinesData || []}
        pagination={false}
        rowKey={(row) => row._id}
      />
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={3}>Sales Reports</Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
          disabled={!tableData.data || tableData.data.length === 0 || tableData.loading}
          size="middle"
        >
          Export to Excel
        </Button>
      </div>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <Formik
          initialValues={{
            dateRange: [moment(), moment()],
          }}
          validationSchema={ReportSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values, errors, touched, isValid }) => {
            return (
              <Form>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <RangePicker
                    name="dateRange"
                    format="YYYY-MM-DD"
                    onChange={(value) => {
                      setFieldValue("dateRange", value);
                    }}
                    value={values.dateRange}
                    disabledDate={(current) => {
                      // Disable future dates
                      return current && current > moment().endOf("day");
                    }}
                  />
                  {errors.dateRange && touched.dateRange && (
                    <div style={{ color: "red" }}>{errors.dateRange}</div>
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!isValid}
                    size="small"
                  >
                    Get Report
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
      <div>
        <Table
          loading={tableData?.loading}
          dataSource={tableData.data || []}
          columns={columns}
          rowKey="_id"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              record.medicines && record.medicines.length > 0,
          }}
          pagination={{
            current: tableData.currentPage || 1,
            total: tableData.totalDocs || 10,
            pageSize: 10,
            onChange: (page) => {
              getSalesReport({
                page,
              });
            },
          }}
        />
      </div>
    </div>
  );
}

export default WithMessage(Index);
