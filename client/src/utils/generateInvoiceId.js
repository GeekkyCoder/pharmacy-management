function generateInvoiceId() {
  const randomNum = Math.floor(Math.random() * 10000); // 0 to 9999
  const paddedNumber = String(randomNum).padStart(4, "0"); // ensure 4 digits

  return `INV${paddedNumber}`;
}

export default generateInvoiceId;
