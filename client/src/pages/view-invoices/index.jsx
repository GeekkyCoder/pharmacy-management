import React, { useEffect, useState } from "react";
import { Table, Typography, Input, Space, Button, Modal, Tag } from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import axios from "../../api/axios";
import WithMessages from "../../hocs/messages";
import WithLoader from "../../hocs/loader";

const { Title } = Typography;
const { Search } = Input;

const ViewInvoices = (props) => {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pharmacyInfo, setPharmacyInfo] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const fetchInvoices = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get("/invoice/getAllInvoices", {
        params: { page, limit, search },
      });

      const { data, total, page: current, limit: pageSize } = response.data;

      setInvoices(data?.invoices);
      setPagination({ current, pageSize, total });
    } catch (error) {
      props.error(error?.response?.data?.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacyInfo = async () => {
    try {
      const response = await axios.get("/pharmacy-info");
      if (response.data.success) {
        setPharmacyInfo(response.data.data);
      }
    } catch (error) {
      props.error(
        error?.response?.data?.message || "Failed to fetch pharmacy information"
      );
    }
  };

  useEffect(() => {
    fetchInvoices(pagination.current, pagination.pageSize, search);
    fetchPharmacyInfo();
  }, []);

  const handleTableChange = (pagination) => {
    fetchInvoices(pagination.current, pagination.pageSize, search);
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchInvoices(1, pagination.pageSize, value);
  };

  console.log("Pharmacy Info:", pharmacyInfo);

  const generateInvoiceHTML = (invoice) => {
    if (!pharmacyInfo) {
      props.error("Pharmacy information is not available");
      return;
    }

    const defaultPharmacyInfo = pharmacyInfo;

    return `
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceId}</title>
          <style>
            @page { margin: 0; size: 80mm 297mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              background: white;
              width: 80mm;
              margin: 0 auto;
              padding: 8px;
            }
            .receipt-container { width: 100%; max-width: 76mm; margin: 0 auto; }
            .header {
              text-align: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid #000;
            }
            .logo {
              max-width: 60px;
              height: auto;
              margin: 0 auto 8px;
              display: block;
              border-radius: 50%;
            }
            .pharmacy-name {
              font-size: 16px;
              font-weight: bold;
              margin: 4px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .pharmacy-tagline {
              font-size: 10px;
              font-style: italic;
              margin: 2px 0;
              color: #555;
            }
            .pharmacy-details {
              font-size: 9px;
              margin: 2px 0;
              line-height: 1.2;
            }
            .license-info {
              font-size: 8px;
              margin-top: 4px;
              color: #666;
            }
            .invoice-header {
              text-align: center;
              margin: 10px 0;
              padding: 6px 0;
              background: #f0f0f0;
              border: 1px solid #ccc;
            }
            .invoice-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .customer-info {
              margin: 10px 0;
              padding: 6px;
              background: #f9f9f9;
              border: 1px dashed #999;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
              font-size: 10px;
            }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .solid-divider { border-top: 2px solid #000; margin: 8px 0; }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
            }
            .items-table th {
              background: #e0e0e0;
              padding: 4px 2px;
              font-size: 9px;
              font-weight: bold;
              text-align: left;
              border-bottom: 1px solid #999;
            }
            .items-table td {
              padding: 3px 2px;
              font-size: 9px;
              border-bottom: 1px dotted #ccc;
              vertical-align: top;
            }
            .item-name {
              font-weight: bold;
              max-width: 30mm;
              word-wrap: break-word;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .discount-info {
              background: #e8f5e8;
              padding: 4px;
              margin: 4px 0;
              border: 1px dashed #4CAF50;
              font-size: 9px;
            }
            .totals-section {
              margin: 10px 0;
              padding: 8px;
              background: #f5f5f5;
              border: 1px solid #ddd;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 10px;
            }
            .final-total {
              font-size: 14px;
              font-weight: bold;
              padding: 4px 0;
              border-top: 2px solid #000;
              margin-top: 4px;
            }
            .savings-highlight {
              color: #4CAF50;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px solid #000;
              font-size: 8px;
              line-height: 1.3;
            }
            .thank-you {
              font-size: 10px;
              font-weight: bold;
              margin: 4px 0;
            }
            .return-policy {
              font-size: 7px;
              color: #666;
              margin: 2px 0;
            }
            .qr-placeholder {
              width: 30px;
              height: 30px;
              background: #ddd;
              margin: 8px auto;
              border: 1px solid #999;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6px;
            }
            @media print {
              body { margin: 0; padding: 8px; }
              .receipt-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="pharmacy-name">${
                defaultPharmacyInfo.pharmacyName
              }</div>
              <div class="pharmacy-details">
                ${defaultPharmacyInfo.address?.street}<br>
                ${defaultPharmacyInfo.address?.city}, ${
      defaultPharmacyInfo.address?.state
    }<br>
                Tel: ${defaultPharmacyInfo.contactInfo?.phone}<br>
                Email: ${defaultPharmacyInfo.contactInfo?.email}
              </div>
            </div>

            <div class="invoice-header">
              <div class="invoice-title">SALES INVOICE</div>
              <div>Invoice #: ${invoice.invoiceId}</div>
            </div>

            <div class="customer-info">
              <div class="info-row">
                <span><strong>Customer:</strong></span>
                <span>${invoice.C_Name}</span>
              </div>
              <div class="info-row">
                <span><strong>Customer ID:</strong></span>
                <span>${invoice.C_ID}</span>
              </div>
              <div class="info-row">
                <span><strong>Date:</strong></span>
                <span>${dayjs(invoice.createdAt).format("DD MMM YYYY")}</span>
              </div>
              <div class="info-row">
                <span><strong>Time:</strong></span>
                <span>${dayjs(invoice.createdAt).format("hh:mm A")}</span>
              </div>
              <div class="info-row">
                <span><strong>Served by:</strong></span>
                <span>${invoice.employee?.userName || "Staff"}</span>
              </div>
            </div>

            <div class="divider"></div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Item</th>
                  <th style="width: 15%;" class="text-center">Qty</th>
                  <th style="width: 20%;" class="text-right">Price</th>
                  <th style="width: 25%;" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  ?.map((item) => {
                    const hasDiscount =
                      item.finalPrice &&
                      item.finalPrice < item.Med_Price * item.Med_Qty;
                    return `
                    <tr>
                      <td class="item-name">${item.Med_Name}</td>
                      <td class="text-center">${item.Med_Qty}</td>
                      <td class="text-right">PKR ${item.Med_Price?.toFixed(
                        2
                      )}</td>
                      <td class="text-right">
                        ${
                          hasDiscount
                            ? `<div style="text-decoration: line-through; color: #999; font-size: 8px;">PKR ${(
                                item.Med_Price * item.Med_Qty
                              ).toFixed(2)}</div>
                           <div style="color: #4CAF50; font-weight: bold;">PKR ${item.finalPrice?.toFixed(
                             2
                           )}</div>`
                            : `PKR ${(item.Med_Price * item.Med_Qty).toFixed(
                                2
                              )}`
                        }
                      </td>
                    </tr>
                    ${
                      hasDiscount && item.discount
                        ? `<tr>
                         <td colspan="4" style="font-size: 8px; color: #4CAF50; font-style: italic;">
                           ↳ ${item.discount.name} (-PKR ${(
                            item.Med_Price * item.Med_Qty -
                            item.finalPrice
                          ).toFixed(2)})
                         </td>
                       </tr>`
                        : ""
                    }
                  `;
                  })
                  .join("")}
              </tbody>
            </table>

            <div class="divider"></div>

            ${
              invoice.totalSavings && invoice.totalSavings > 0
                ? `
              <div class="discount-info">
                <div style="font-weight: bold; margin-bottom: 2px;">💰 Savings Applied!</div>
                <div>You saved PKR ${invoice.totalSavings?.toFixed(
                  2
                )} on this purchase</div>
              </div>
            `
                : ""
            }

            <div class="totals-section">
              <div class="total-row">
                <span>Total Items:</span>
                <span><strong>${invoice.No_Of_Items}</strong></span>
              </div>
              ${
                invoice.totalSavings && invoice.totalSavings > 0
                  ? `
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>PKR ${invoice.originalPrice?.toFixed(2)}</span>
                </div>
                <div class="total-row savings-highlight">
                  <span>Total Savings:</span>
                  <span>-PKR ${invoice.totalSavings?.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div class="total-row final-total">
                <span>TOTAL AMOUNT:</span>
                <span>PKR ${invoice.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            <div class="solid-divider"></div>

            <div class="footer">
              <div class="thank-you">Thank You for Your Purchase!</div>

              <div>Your health is our priority</div>
                
              <div class="return-policy">
                • Medicine returns accepted within 7 days with receipt<br>
                • Keep this receipt for warranty claims<br>
                • For queries: ${defaultPharmacyInfo.contactInfo?.phone}
              </div>
              
              <div style="margin-top: 8px; font-weight: bold;">
                Generated by ${defaultPharmacyInfo.pharmacyName} 
              </div>
              
              <div style="margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">
                *** End of Receipt ***
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleViewInvoice = async (invoice) => {
    console.log("invoice", invoice);

    props.setLoading(true);

    try {
      // Create a Set of unique medicine IDs from the current invoice
      const invoiceMedIds = new Set(
        invoice.items
          ?.map((item) => item.med?._id?.toString())
          .filter((id) => id)
      );

      // Only fetch discounts for medicines present in this invoice
      const discountPromises = Array.from(invoiceMedIds).map((medId) => {
        // Get the quantity from the invoice item for this medicine
        const item = invoice.items.find(
          (item) => item.med?._id?.toString() === medId
        );
        const quantity = item ? item.Med_Qty : 1;

        return axios
          .post(`/discount/apply-to-medicine`, {
            medicineId: medId,
            quantity: quantity,
          })
          .then((response) => ({
            medicineId: medId,
            ...response.data,
          }))
          .catch((error) => {
            console.error(
              `Error fetching discount for medicine ${medId}:`,
              error
            );
            return { medicineId: medId, success: false };
          });
      });

      const discountResponses = await Promise.all(discountPromises);

      // Create a mapping of medicine ID to discount data
      const discountMap = {};
      discountResponses.forEach((response) => {
        if (response.success && response.data) {
          discountMap[response.medicineId] = response.data;
        }
      });

      // Apply discounts to invoice items
      const updatedItems = invoice.items?.map((item) => {
        const medicineId = item.med?._id?.toString();
        const discount = discountMap[medicineId];

        if (discount) {
          return {
            ...item,
            originalAmount: discount.originalAmount,
            finalAmount: discount.finalAmount,
          };
        }

        // If no discount found, calculate original values
        return {
          ...item,
          originalAmount: item.Med_Price * item.Med_Qty,
          finalAmount: item.Med_Price * item.Med_Qty,
        };
      });

      // Calculate totals
      const originalPrice = updatedItems.reduce(
        (sum, item) => sum + (item.originalAmount || 0),
        0
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + (item.finalAmount || 0),
        0
      );
      const totalSavings = originalPrice - totalPrice;

      const updatedInvoice = {
        ...invoice,
        items: updatedItems,
        originalPrice,
        totalPrice,
        totalSavings: totalSavings > 0 ? totalSavings : 0,
      };

      setSelectedInvoice(updatedInvoice);
      setModalVisible(true);
    } catch (error) {
      console.error("Error processing invoice discounts:", error);
      props.error("Failed to process discounts for invoice");
      // Still show the invoice without discount data
      setSelectedInvoice(invoice);
      setModalVisible(true);
    } finally {
      props.setLoading(false);
    }
  };

  // console.log('selectedInvoice', selectedInvoice)

  const handleDownloadPDF = (invoice) => {
    setDownloadLoading(true);
    const printWindow = window.open("", "", "height=600,width=400");

    try {
      printWindow.document.open();
      printWindow.document.write(generateInvoiceHTML(invoice));
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (err) {
      console.error("Error generating PDF:", err);
      props.error("Failed to generate PDF");
      setDownloadLoading(false);
    } finally {
      setDownloadLoading(false);
    }
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
      title: "Total Amount",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (amount, record) => {
        let total = 0;

        record.items.forEach((item) => {
          total += item.Med_Qty * item.Med_Price;
        });
        return (
          <div>
            <strong>PKR {total?.toFixed(2)}</strong>
            {record.totalSavings > 0 && (
              <div>
                <Tag color="green" size="small">
                  Saved PKR {record.totalSavings?.toFixed(2)}
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "No. of Items",
      dataIndex: "No_Of_Items",
      key: "No_Of_Items",
    },
    {
      title: "Sale Performed By",
      dataIndex: "employee",
      key: "employee",
      render: (employee) =>
        employee ? `${employee.userName} (${employee?.role})` : "N/A",
    },
    {
      title: "Invoice Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) =>
        dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewInvoice(record)}
            title="View Invoice"
          />
          {/* <Button
            type="default"
            icon={<DownloadOutlined />}
            size="small"
            loading={downloadLoading}
            onClick={() => handleDownloadPDF(record)}
            title="Download PDF"
          /> */}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const medColumns = [
      { title: "Medicine Name", dataIndex: "Med_Name", key: "Med_Name" },
      { title: "Quantity", dataIndex: "Med_Qty", key: "Med_Qty" },
      {
        title: "Unit Price",
        dataIndex: "Med_Price",
        key: "Med_Price",
        render: (price) => `PKR ${price?.toFixed(2)}`,
      },
      {
        title: "Total",
        key: "total",
        render: (_, item) => {
          const originalTotal = item.Med_Price * item.Med_Qty;
          const finalTotal = item.finalPrice || originalTotal;
          const hasDiscount = finalTotal < originalTotal;

          return (
            <div>
              {hasDiscount && (
                <div
                  style={{
                    textDecoration: "line-through",
                    color: "#999",
                    fontSize: "12px",
                  }}
                >
                  PKR {originalTotal.toFixed(2)}
                </div>
              )}
              <div
                style={{
                  color: hasDiscount ? "#4CAF50" : "inherit",
                  fontWeight: hasDiscount ? "bold" : "normal",
                }}
              >
                PKR {finalTotal.toFixed(2)}
              </div>
              {hasDiscount && item.discount && (
                <Tag color="green" size="small">
                  {item.discount.name}
                </Tag>
              )}
            </div>
          );
        },
      },
    ];
    return (
      <Table
        columns={medColumns}
        dataSource={record.items}
        rowKey={(item, idx) => idx}
        pagination={false}
        size="small"
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
            placeholder="Search by customer name or invoice ID"
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
        scroll={{ x: 1000 }}
      />

      {/* Invoice View Modal */}
      <Modal
        title={`Invoice Details - ${selectedInvoice?.invoiceId}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedInvoice(null);
        }}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloadLoading}
            onClick={() => handleDownloadPDF(selectedInvoice)}
          >
            Download PDF
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setModalVisible(false);
              setSelectedInvoice(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={800}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {selectedInvoice && pharmacyInfo && (
          <div
            style={{
              width: "80mm",
              padding: 12,
              display: "block",
              margin: "0 auto",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              lineHeight: "1.4",
              transform: "scale(1.2)",
              transformOrigin: "top center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "2px solid #000",
              }}
            >
              {/* <img
                src={pharmacyInfo?.pharmacyLogo}
                alt="Logo"
                style={{ width: 50, height: "auto", marginBottom: 8, borderRadius: "50%" }}
              /> */}
              <h3
                style={{
                  margin: "4px 0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {pharmacyInfo?.pharmacyName}
              </h3>
              {/* <div style={{ fontSize: 10, fontStyle: "italic", color: "#555" }}>
                {pharmacyInfo?.description}
              </div> */}
              <div style={{ fontSize: 9, margin: "4px 0" }}>
                {pharmacyInfo?.address?.street}
                <br />
                {pharmacyInfo?.address?.city}, {pharmacyInfo?.address?.state}
                <br />
                Tel: {pharmacyInfo?.contactInfo?.phone}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                margin: "10px 0",
                padding: "6px 0",
                background: "#f0f0f0",
                border: "1px solid #ccc",
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}
              >
                SALES INVOICE
              </div>
              <div>Invoice #: {selectedInvoice.invoiceId}</div>
            </div>

            <div
              style={{
                margin: "10px 0",
                padding: 6,
                background: "#f9f9f9",
                border: "1px dashed #999",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "2px 0",
                  fontSize: 10,
                }}
              >
                <span>
                  <strong>Customer:</strong>
                </span>
                <span>{selectedInvoice.C_Name}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "2px 0",
                  fontSize: 10,
                }}
              >
                <span>
                  <strong>Customer ID:</strong>
                </span>
                <span>{selectedInvoice.C_ID}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "2px 0",
                  fontSize: 10,
                }}
              >
                <span>
                  <strong>Date:</strong>
                </span>
                <span>
                  {dayjs(selectedInvoice.createdAt).format("DD MMM YYYY")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "2px 0",
                  fontSize: 10,
                }}
              >
                <span>
                  <strong>Time:</strong>
                </span>
                <span>
                  {dayjs(selectedInvoice.createdAt).format("hh:mm A")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "2px 0",
                  fontSize: 10,
                }}
              >
                <span>
                  <strong>Served by:</strong>
                </span>
                <span>{selectedInvoice.employee?.userName || "Staff"}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            <table
              style={{
                width: "100%",
                fontSize: 9,
                borderCollapse: "collapse",
                margin: "8px 0",
              }}
            >
              <thead>
                <tr style={{ background: "#e0e0e0" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "4px 2px",
                      fontWeight: "bold",
                      borderBottom: "1px solid #999",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "4px 2px",
                      fontWeight: "bold",
                      borderBottom: "1px solid #999",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 2px",
                      fontWeight: "bold",
                      borderBottom: "1px solid #999",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 2px",
                      fontWeight: "bold",
                      borderBottom: "1px solid #999",
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items?.map((item, index) => {
                  console.log("ittttt", item);
                  const hasDiscount =
                    item.finalAmount &&
                    item.finalAmount < item.Med_Price * item.Med_Qty;
                  const finalAmount =
                    item.finalAmount || item.Med_Price * item.Med_Qty;

                  return (
                    <tr key={index} style={{ borderBottom: "1px dotted #ccc" }}>
                      <td
                        style={{
                          padding: "3px 2px",
                          fontWeight: "bold",
                          maxWidth: "30mm",
                          wordWrap: "break-word",
                        }}
                      >
                        {item.Med_Name}
                      </td>
                      <td style={{ padding: "3px 2px", textAlign: "center" }}>
                        {item.Med_Qty}
                      </td>
                      <td style={{ padding: "3px 2px", textAlign: "right" }}>
                        PKR {item.Med_Price?.toFixed(2)}
                      </td>
                      <td style={{ padding: "3px 2px", textAlign: "right" }}>
                        {hasDiscount ? (
                          <div>
                            <div
                              style={{
                                textDecoration: "line-through",
                                color: "#999",
                                fontSize: "8px",
                              }}
                            >
                              PKR {(item.Med_Price * item.Med_Qty).toFixed(2)}
                            </div>
                            <div
                              style={{ color: "#4CAF50", fontWeight: "bold" }}
                            >
                              PKR {finalAmount.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          `PKR ${finalAmount.toFixed(2)}`
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            {selectedInvoice.totalSavings &&
              selectedInvoice.totalSavings > 0 && (
                <div
                  style={{
                    background: "#e8f5e8",
                    padding: 4,
                    margin: "4px 0",
                    border: "1px dashed #4CAF50",
                    fontSize: 9,
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 2 }}>
                    💰 Savings Applied!
                  </div>
                  <div>
                    Customer saved PKR{" "}
                    {selectedInvoice.totalSavings?.toFixed(2)} on this purchase
                  </div>
                </div>
              )}

            <div
              style={{
                margin: "10px 0",
                padding: 8,
                background: "#f5f5f5",
                border: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "3px 0",
                  fontSize: 10,
                }}
              >
                <span>Total Items:</span>
                <span>
                  <strong>{selectedInvoice.No_Of_Items}</strong>
                </span>
              </div>
              {selectedInvoice.totalSavings &&
                selectedInvoice.totalSavings > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        margin: "3px 0",
                        fontSize: 10,
                      }}
                    >
                      <span>Subtotal:</span>
                      <span>
                        PKR {selectedInvoice.originalPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        margin: "3px 0",
                        fontSize: 10,
                        color: "#4CAF50",
                        fontWeight: "bold",
                      }}
                    >
                      <span>Total Savings:</span>
                      <span>
                        -PKR {selectedInvoice.totalSavings?.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  fontWeight: "bold",
                  padding: "4px 0",
                  borderTop: "2px solid #000",
                  marginTop: 4,
                }}
              >
                <span>TOTAL AMOUNT:</span>
                <span>PKR {selectedInvoice.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ borderTop: "2px solid #000", margin: "8px 0" }} />

            <div
              style={{
                textAlign: "center",
                marginTop: 12,
                paddingTop: 8,
                borderTop: "2px solid #000",
                fontSize: 8,
                lineHeight: "1.3",
              }}
            >
              <div
                style={{ fontSize: 10, fontWeight: "bold", margin: "4px 0" }}
              >
                Thank You for Your Purchase!
              </div>
              <div>Your health is our priority</div>
              <div style={{ fontSize: 7, color: "#666", margin: "2px 0" }}>
                • Medicine returns accepted within 7 days with receipt
                <br />
                • Keep this receipt for warranty claims
                <br />• For queries: {pharmacyInfo?.contactInfo?.phone}
              </div>
              <div style={{ marginTop: 8, fontWeight: "bold" }}>
                Generated by {pharmacyInfo?.pharmacyName}
              </div>
              <div
                style={{
                  marginTop: 4,
                  borderTop: "1px dashed #000",
                  paddingTop: 4,
                }}
              >
                *** End of Receipt ***
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WithLoader(WithMessages(ViewInvoices));
