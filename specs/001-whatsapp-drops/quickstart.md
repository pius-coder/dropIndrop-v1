# Quickstart Guide: DropInDrop WhatsApp E-commerce Platform

## Overview

This guide provides step-by-step instructions for setting up and testing the DropInDrop platform, a WhatsApp-based e-commerce solution that enables product sales through WhatsApp drops.

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- PostgreSQL database running
- WhatsApp Business account or WAHA setup
- Stripe account for payment processing

## Environment Setup

### 1. Clone and Setup Project

```bash
git clone <repository-url>
cd did-v1
pnpm install
```

### 2. Environment Variables

Create `.env.local` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dropindrop"

# WhatsApp (WAHA)
WAHA_API="http://localhost:8000"
SESSION_NAME="default"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# Seed initial data (optional)
pnpm prisma db seed
```

## Development Server

```bash
# Start development server
pnpm dev

# Server will be available at http://localhost:3000
```

## Testing Workflow

### Phase 1: Platform Configuration

1. **Access Admin Interface**

   - Navigate to `http://localhost:3000/admin`
   - Login with default super admin credentials (check seed data)

2. **Initial Configuration**
   - Complete the first-time setup wizard
   - Configure WhatsApp settings (WAHA API endpoint)
   - Set up payment gateway (Stripe)
   - Create initial product categories

### Phase 2: Product Management

3. **Create Sample Products**

   - Go to Admin → Products → "Create Product"
   - Add sample products with:
     - Name and description
     - Price and category
     - At least one product image
     - Stock quantity

4. **Test Product CRUD**
   - Create multiple products across different categories
   - Edit existing products
   - Test product search and filtering

### Phase 3: Drop Creation

5. **Create Product Drops**

   - Go to Admin → Products and select multiple products
   - Click "Create Drop" and set a future date/time
   - Verify drop appears in calendar view

6. **Configure WhatsApp Groups**
   - Go to Admin → WhatsApp Groups
   - Add test WhatsApp group chat IDs
   - Ensure WAHA session is connected

### Phase 4: WhatsApp Integration

7. **Send Test Drop**

   - Select a draft drop from the calendar
   - Click "Send to WhatsApp"
   - Choose test groups and send
   - Verify message delivery in WhatsApp

8. **Test Product Links**
   - Click on product links in sent WhatsApp messages
   - Verify products load correctly
   - Check that view counts increment

### Phase 5: Client Journey

9. **Client Registration**

   - Click a product link from WhatsApp
   - Enter phone number for OTP
   - Receive and enter OTP code via WhatsApp
   - Complete registration process

10. **Order Placement**
    - Browse product from WhatsApp link
    - Click "Purchase" and proceed to payment
    - Complete Stripe payment flow
    - Receive ticket with QR code

### Phase 6: Delivery Verification

11. **Generate Test Tickets**

    - Complete test purchases to generate tickets
    - Verify QR codes and unique codes are created

12. **Test Delivery Process**
    - Go to delivery verification interface
    - Test QR code scanning
    - Test manual code entry
    - Verify order status updates

## API Testing

### Using cURL

```bash
# Get all products
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/products

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product for DropInDrop",
    "price": 29.99,
    "categoryId": "category-uuid",
    "images": ["https://example.com/image.jpg"]
  }'

# Send OTP to client
curl -X POST http://localhost:3000/api/auth/client/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

### Using Postman

1. Import the OpenAPI specification from `specs/001-whatsapp-drops/contracts/openapi.yaml`
2. Set up environment variables for authentication tokens
3. Test endpoints in the order described above

## Mobile Testing

### Mobile Browser Testing

1. **Chrome DevTools Mobile Emulation**

   - Open Chrome DevTools (F12)
   - Click device toggle button
   - Select mobile device for testing

2. **Physical Device Testing**
   - Access `http://localhost:3000` on mobile device (if on same network)
   - Use ngrok for external access: `ngrok http 3000`

### WhatsApp Integration Testing

1. **WAHA Setup** (if using WAHA)

   ```bash
   docker run -p 8000:8000 devlikeapro/waha:plus
   # Scan QR code with WhatsApp
   ```

2. **Test Message Sending**
   - Ensure WAHA session is authenticated
   - Send test drops to personal WhatsApp groups
   - Verify message formatting and link generation

## Performance Testing

### Load Testing

```bash
# Install testing tools
npm install -g artillery

# Run basic load test
artillery quick --count 100 --num 10 http://localhost:3000/api/products
```

### Database Performance

```bash
# Check slow queries
pnpm prisma studio

# Monitor database performance
pnpm prisma db execute --file monitor.sql
```

## Troubleshooting

### Common Issues

1. **WhatsApp API Connection Failed**

   - Verify WAHA is running and authenticated
   - Check SESSION_NAME matches WAHA configuration
   - Ensure WhatsApp app is not running on same number

2. **Payment Processing Errors**

   - Verify Stripe webhook endpoints are configured
   - Check Stripe dashboard for failed payments
   - Ensure webhook secret matches environment variable

3. **QR Code Scanning Issues**

   - Test with different QR code readers
   - Verify QR code data format
   - Check camera permissions on mobile devices

4. **Authentication Problems**
   - Clear browser cookies and local storage
   - Verify JWT token expiration
   - Check database user creation

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
WAHA_DEBUG=true
```

## Success Metrics

After completing the quickstart:

- [ ] Platform configuration completed in <5 minutes
- [ ] Product creation and management working
- [ ] WhatsApp drop sending functional
- [ ] Client authentication via OTP working
- [ ] Payment processing and ticket generation working
- [ ] Delivery verification system operational
- [ ] All API endpoints responding correctly
- [ ] Mobile interface fully functional

## Next Steps

Once testing is complete:

1. **Security Review**: Audit authentication and payment security
2. **Performance Optimization**: Optimize database queries and image loading
3. **Error Monitoring**: Set up error tracking and alerting
4. **Documentation**: Create user manuals for admins and delivery managers
5. **Deployment**: Prepare for production deployment

## Support

For issues during setup:

1. Check the troubleshooting section above
2. Review logs in the console/terminal
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are installed and running
