const Payment = require('../models/Payment');

// Create Payment
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, userId, amount, status } = req.body;

    const payment = new Payment({
      bookingId,
      userId,
      amount,
      status
    });

    await payment.save();
    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('bookingId', 'propertyId startDate endDate')
      .populate('userId', 'fullName email');
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId', 'propertyId startDate endDate')
      .populate('userId', 'fullName email');
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Payment
exports.updatePayment = async (req, res) => {
  try {
    const updates = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ message: "Payment updated", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
