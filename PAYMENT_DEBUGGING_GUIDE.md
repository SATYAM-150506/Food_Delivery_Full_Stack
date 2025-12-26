# Payment Integration Debugging Guide

## Issues Fixed

### 1. **404 Error on Payment Verification** ✅
**Error**: `POST https://food-delivery-full-stack-2.onrender.com/api/payment/verify 404 (Not Found)`

**Root Cause**: 
- The Order model was missing `razorpayOrderId` and `razorpaySignature` fields
- Payment verification endpoint expects to find an order by `razorpayOrderId`

**Solution Applied**:
- Added `razorpayOrderId` field to Order schema for storing Razorpay order ID
- Added `razorpaySignature` field to Order schema for storing signature
- Updated [backend/src/models/Order.js](backend/src/models/Order.js)

### 2. **Mixed Content Warnings** ✅
**Error**: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure element`

**Root Causes**:
- Frontend using `http://` in development
- Backend FRONTEND_URL still pointing to `http://localhost:3000`
- Payment gateway trying to load HTTP resources from HTTPS pages

**Solutions Applied**:
- Updated [backend/.env](backend/.env):
  - Changed `NODE_ENV` from `development` to `production`
  - Changed `FRONTEND_URL` from `http://localhost:3000` to `https://food-delivery-full-stack-2.onrender.com`
- Added HTTPS redirect middleware in [backend/src/app.js](backend/src/app.js)
- Added security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### 3. **CORS Issues** ✅
**Error**: `Access to XMLHttpRequest from origin blocked by CORS`

**Root Cause**: 
- CORS origin configured as `http://localhost:3000` but frontend is now deployed with different URL

**Solution Applied**:
- CORS now properly configured with deployed frontend URL
- `withCredentials: true` enabled in payment service
- All API calls include proper Authorization headers

### 4. **Other Console Errors** ℹ️
These are third-party service errors and can be safely ignored:

- **Razorpay Fingerprint Headers**: "Refused to get unsafe header x-rtb-fingerprint-id"
  - Razorpay tracking header, doesn't affect functionality
  
- **Sardine/Sentry Permissions Policy**: "Violation: accelerometer is not allowed"
  - Third-party fraud detection/error monitoring trying to access device sensors
  - Add to your HTML head if you want to suppress:
    ```html
    <meta http-equiv="Permissions-Policy" content="accelerometer=(), gyroscope=(), magnetometer=()">
    ```

- **Localhost Connection Refused**: Attempts to connect to `localhost:37857`, `localhost:7070`
  - These are analytics services trying to report back to local ports
  - Harmless in production

## Deployment Checklist

Before deploying, ensure:

### Backend (.env)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=<your-deployed-frontend-url>` (must use HTTPS)
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- [ ] `MONGODB_URI` and `JWT_SECRET` are set

### Frontend (.env.production)
- [ ] `REACT_APP_API_URL=<your-deployed-backend-url>` (must use HTTPS)
- [ ] `REACT_APP_RAZORPAY_KEY_ID` matches backend

### Render Deployment
- [ ] Backend environment variables are set in Render dashboard
- [ ] Frontend build points to correct API URL
- [ ] SSL/TLS is enabled (automatic on Render)

## Testing Payment Flow

### Step 1: Create Order
```
POST /api/payment/pay
{
  amount: 1000,
  items: [...],
  address: {...},
  total: 1000
}
```

### Step 2: Initialize Razorpay
The response includes:
- `razorpayOrder.id` → Razorpay Order ID
- `key_id` → Public key for Razorpay
- `amount` → Total amount in paise

### Step 3: Update Order with Razorpay ID
```
PATCH /api/orders/{orderId}
{
  razorpayOrderId: "order_..." // From Razorpay
}
```

### Step 4: Verify Payment
```
POST /api/payment/verify
{
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_...",
  razorpaySignature: "signature..."
}
```

The backend will:
1. Verify the signature
2. Find the order by `razorpayOrderId`
3. Update payment status to "completed"
4. Update order status to "confirmed"
5. Return success response

## Troubleshooting

### 404 on /api/payment/verify
- Check if `razorpayOrderId` was properly saved to Order
- Verify the order exists before payment verification
- Check MongoDB for the order document

### Payment verification fails
- Ensure `razorpayOrderId` matches what Razorpay returned
- Verify Razorpay secret key in backend .env
- Check if signature verification logic is correct

### CORS errors persist
- Verify `FRONTEND_URL` in backend .env matches your frontend URL
- Check if both frontend and backend are using HTTPS
- Clear browser cache and cookies

### Orders not showing after payment
- Check if order status is updating to "confirmed"
- Verify the order notification is being triggered
- Check OrderHistory component for filter issues

## Security Notes

✅ **Implemented**:
- HTTPS redirect middleware
- CORS with credentials support
- Security headers (X-Content-Type-Options, X-Frame-Options)
- Bearer token authentication
- Signature verification for Razorpay payments

⚠️ **Additional Considerations**:
- Use Razorpay webhook for production (currently not implemented)
- Add rate limiting for payment endpoints
- Implement retry logic for failed payments
- Add audit logging for payment events
- Test with Razorpay test keys first

## Related Files
- [backend/src/app.js](backend/src/app.js) - HTTPS and security middleware
- [backend/.env](backend/.env) - Environment configuration
- [backend/src/models/Order.js](backend/src/models/Order.js) - Order schema with payment fields
- [backend/src/controllers/paymentController.js](backend/src/controllers/paymentController.js) - Payment logic
- [backend/src/routes/paymentRoutes.js](backend/src/routes/paymentRoutes.js) - API routes
- [frontend/src/assets/services/paymentService.js](frontend/src/assets/services/paymentService.js) - Frontend API calls
- [frontend/src/assets/pages/Payment/Checkout.jsx](frontend/src/assets/pages/Payment/Checkout.jsx) - Payment UI
