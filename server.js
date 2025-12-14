const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/properties', require('./routes/propertyRoutes.js'));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api", require("./routes/ownerPaymentRoutes"));

app.use("/api/visits", require("./routes/visitRoutes"));
app.use("/api/dashboard/owner", require("./routes/ownerDashboardRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));

app.use("/api/profile", require("./routes/profileRoutes"));

app.use("/api/tenant", require("./routes/tenantPropertyRoutes"));
app.use("/api/tenant", require("./routes/tenantBookingRoutes"));
app.use("/api/tenant", require("./routes/tenantReviewRoutes"));
app.use("/api/tenant", require("./routes/tenantPaymentRoutes"));
app.use("/api/tenant/profile", require("./routes/tenantProfileRoutes"));
app.use("/api/tenant/notifications", require("./routes/tenantNotificationRoutes"));
app.use("/api/tenant", require("./routes/tenantDashboardRoutes"));
app.use("/api/tenant", require("./routes/tenantWishlistRoutes"));
app.use("/api/tenant", require("./routes/tenantVisitRoutes"));
app.use("/api/tenant", require("./routes/tenantSubscriptionRoutes"));


//Admin
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes"));
app.use("/api/admin/properties", require("./routes/adminPropertyRoutes"));
app.use("/api/admin/bookings", require("./routes/adminBookingRoutes"));
app.use("/api/admin/reports", require("./routes/adminReportRoutes"));
app.use("/api/admin/support", require("./routes/adminSupportRoutes"));
app.use("/api/admin/reviews", require("./routes/adminReviewRoutes"));
app.use("/api/admin/notifications", require("./routes/adminNotificationRoutes"));
app.use("/api/admin/dashboard", require("./routes/adminDashboardRoutes"));


// Root route
app.get('/', (req, res) => {
  res.send('EasyRentalSpot Backend API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
