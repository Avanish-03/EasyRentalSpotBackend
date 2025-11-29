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
app.use('/api/properties', require('./routes/properties.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/wishlists', require('./routes/wishlists.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/admin-actions', require('./routes/adminActions.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/subscriptions', require('./routes/subscriptions.routes'));
app.use('/api/amenities', require('./routes/amenities.routes'));
app.use('/api/locations', require('./routes/locations.routes'));
app.use('/api/property-visits', require('./routes/propertyVisits.routes'));
app.use('/api/documents', require('./routes/documents.routes'));
app.use('/api/support', require('./routes/support.routes'));

// Root route
app.get('/', (req, res) => {
  res.send('EasyRentalSpot Backend API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
