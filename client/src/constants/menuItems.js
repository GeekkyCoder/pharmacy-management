const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: '/',
      roles: ['admin', 'employee'],
    },
    {
      key: 'inventory',
      label: 'Inventory',
      roles: ['admin','employee'],
      children: [
        { key: 'manageInventory', label: 'Manage Inventory', path: '/medicine-inventory', roles: ['admin','employee'] },
      ]
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      roles: ['admin','employee'],
      children: [
        { key: 'addSupplier', label: 'Add Supplier', path: '/add-supplier', roles: ['admin','employee'] },
        { key: 'viewSupplier', label: 'View Supplier', path: '/view-supplier', roles: ['admin','employee'] },
      ]
    },
    {
      key: 'employees',
      label: 'Employees',
      roles: ['admin'],
      children: [
        { key: 'addEmployee', label: 'Add Employee', path: '/add-employee', roles: ['admin'] },
        { key: 'manageEmployees', label: 'Manage Employees', path: '/manage-employees', roles: ['admin'] },
      ]
    },
    {
      key: 'viewInvoice',
      label: 'View Sales Invoice Details',
      path: '/view-sales-invoices',
      roles: ['admin', 'employee'],
    },
    {
      key: 'viewSold',
      label: 'View Sold Products Details',
      path: '/view-sold-products',
      roles: ['admin', 'employee'],
    },
    {
      key: 'addSale',
      label: 'Add New Sale',
      path: '/add-sale',
      roles: ['admin','employee'],
    },
    {
      key: 'reports',
      label: 'Reports',
      roles: ['admin'],
      children: [
        { key: 'salesReport', label: 'Sales Report', path: '/sales-report', roles: ['admin'] },
        // { key: 'stockReport', label: 'Stock Report', path: '/stock-report', roles: ['admin'] },
      ]
    }
  ];
  
  export {menuItems}