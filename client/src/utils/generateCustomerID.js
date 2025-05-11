const generateCustomerId = () => {
  const now = Date.now().toString();
  const last8 = now.slice(-8); 
  return `C${last8}`;
};
export default generateCustomerId;
