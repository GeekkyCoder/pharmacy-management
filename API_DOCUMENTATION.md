# Pharmacy Management - Discount & Pharmacy Info APIs

## Discount Management APIs

### Authentication Required
All discount APIs require authentication token in cookies or headers.

---

### 1. Get All Discounts (Admin Only)
**GET** `/discount`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

---

### 2. Get Active Discounts
**GET** `/discount/active`

Returns only currently valid discounts that can be applied.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 2
}
```

---

### 3. Create Discount (Admin Only)
**POST** `/discount`

**Request Body:**
```json
{
  "discountName": "Senior Citizen Discount",
  "discountType": "percentage", // or "fixed"
  "discountValue": 10,
  "description": "10% discount for senior citizens",
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "minimumAmount": 500,
  "maximumDiscount": 1000, // optional, for percentage discounts
  "applicableCategories": ["Pain Relief", "Heart Medication"], // optional
  "applicableMedicines": ["medicineId1", "medicineId2"], // optional
  "usageLimit": 100 // optional, null for unlimited
}
```

---

### 4. Apply Discount to Medicine
**POST** `/discount/apply-to-medicine`

**Request Body:**
```json
{
  "medicineId": "medicine_id_here",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "medicine": {
      "id": "...",
      "name": "Panadol",
      "price": 50,
      "category": "Pain Relief"
    },
    "quantity": 2,
    "originalAmount": 100,
    "discountApplied": {
      "id": "discount_id",
      "name": "Senior Citizen Discount",
      "type": "percentage",
      "value": 10,
      "discountAmount": 10
    },
    "finalAmount": 90,
    "savings": 10
  }
}
```

---

### 5. Calculate Cart Discount
**POST** `/discount/calculate-cart`

**Request Body:**
```json
{
  "items": [
    {
      "medicineId": "medicine_id_1",
      "quantity": 2
    },
    {
      "medicineId": "medicine_id_2",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "summary": {
      "totalOriginalAmount": 500,
      "totalDiscountAmount": 75,
      "totalFinalAmount": 425,
      "totalSavings": 75
    }
  }
}
```

---

### 6. Update Discount (Admin Only)
**PUT** `/discount/:id`

**Request Body:** Same as create discount

---

### 7. Delete Discount (Admin Only)
**DELETE** `/discount/:id`

---

### 8. Toggle Discount Status (Admin Only)
**PATCH** `/discount/:id/toggle-status`

Toggles the `isActive` status of a discount.

---

## Pharmacy Info Management APIs

### 1. Get Pharmacy Info
**GET** `/pharmacy-info`

**Response:**
```json
{
  "success": true,
  "data": {
    "pharmacyName": "HealthCare Plus Pharmacy",
    "ownerName": "Dr. Muhammad Ahmed",
    "licenseNumber": "PH-2024-001234",
    "address": {
      "street": "123 Main Street, Block A",
      "city": "Karachi",
      "state": "Sindh",
      "postalCode": "75300",
      "country": "Pakistan"
    },
    "contactInfo": {
      "phone": "+92-21-1234567",
      "email": "info@healthcareplus.pk",
      "website": "https://healthcareplus.pk"
    },
    "businessHours": {
      "monday": {
        "open": "08:00",
        "close": "22:00",
        "isClosed": false
      },
      // ... other days
    },
    "services": ["Prescription Medicines", "Health Consultations"],
    "isActive": true
  }
}
```

---

### 2. Create Pharmacy Info (Admin Only)
**POST** `/pharmacy-info`

**Request Body:**
```json
{
  "pharmacyName": "HealthCare Plus Pharmacy",
  "ownerName": "Dr. Muhammad Ahmed",
  "licenseNumber": "PH-2024-001234",
  "address": {
    "street": "123 Main Street, Block A",
    "city": "Karachi",
    "state": "Sindh",
    "postalCode": "75300",
    "country": "Pakistan"
  },
  "contactInfo": {
    "phone": "+92-21-1234567",
    "email": "info@healthcareplus.pk",
    "website": "https://healthcareplus.pk",
    "fax": "+92-21-7654321"
  },
  "businessHours": {
    "monday": { "open": "08:00", "close": "22:00", "isClosed": false },
    "tuesday": { "open": "08:00", "close": "22:00", "isClosed": false },
    "wednesday": { "open": "08:00", "close": "22:00", "isClosed": false },
    "thursday": { "open": "08:00", "close": "22:00", "isClosed": false },
    "friday": { "open": "08:00", "close": "22:00", "isClosed": false },
    "saturday": { "open": "09:00", "close": "20:00", "isClosed": false },
    "sunday": { "open": "10:00", "close": "18:00", "isClosed": false }
  },
  "services": [
    "Prescription Medicines",
    "Over-the-Counter Drugs",
    "Health Consultations",
    "Blood Pressure Check",
    "Diabetes Monitoring",
    "Vaccination Services"
  ],
  "description": "Your trusted neighborhood pharmacy providing quality healthcare solutions.",
  "socialMedia": {
    "facebook": "https://facebook.com/healthcareplus",
    "instagram": "https://instagram.com/healthcareplus"
  },
  "taxInfo": {
    "taxId": "TAX-123456789",
    "gstNumber": "GST-987654321"
  }
}
```

---

### 3. Update Pharmacy Info (Admin Only)
**PUT** `/pharmacy-info`

**Request Body:** Same as create (supports partial updates)

---

### 4. Update Business Hours (Admin Only)
**PATCH** `/pharmacy-info/business-hours`

**Request Body:**
```json
{
  "businessHours": {
    "monday": { "open": "08:00", "close": "22:00", "isClosed": false },
    // ... other days
  }
}
```

---

### 5. Update Contact Info (Admin Only)
**PATCH** `/pharmacy-info/contact-info`

**Request Body:**
```json
{
  "contactInfo": {
    "phone": "+92-21-1234567",
    "email": "info@healthcareplus.pk",
    "website": "https://healthcareplus.pk"
  }
}
```

---

### 6. Get Public Pharmacy Info
**GET** `/pharmacy-info/public/:adminId`

**No authentication required.** Returns public information about the pharmacy (excludes sensitive data like bank info, tax details).

---

### 7. Toggle Pharmacy Status (Admin Only)
**PATCH** `/pharmacy-info/toggle-status`

---

### 8. Delete Pharmacy Info (Admin Only)
**DELETE** `/pharmacy-info`

---

## Testing the APIs

### 1. Test Discount Creation:
```bash
curl -X POST http://localhost:8000/discount \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "discountName": "Test Discount",
    "discountType": "percentage",
    "discountValue": 15,
    "validFrom": "2024-01-01",
    "validUntil": "2024-12-31",
    "minimumAmount": 100
  }'
```

### 2. Test Pharmacy Info Creation:
```bash
curl -X POST http://localhost:8000/pharmacy-info \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "pharmacyName": "Test Pharmacy",
    "ownerName": "Dr. Test",
    "licenseNumber": "TEST-123",
    "address": {
      "street": "Test Street",
      "city": "Test City",
      "state": "Test State",
      "postalCode": "12345",
      "country": "Pakistan"
    },
    "contactInfo": {
      "phone": "+92-123-456789",
      "email": "test@pharmacy.com"
    }
  }'
```

### 3. Test Discount Application:
```bash
curl -X POST http://localhost:8000/discount/apply-to-medicine \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "medicineId": "your_medicine_id",
    "quantity": 2
  }'
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
