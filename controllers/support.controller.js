const Support = require('../models/Supportticket');

// Create Support Ticket
exports.createSupport = async (req, res) => {
  try {
    const { userId, subject, message, status } = req.body;

    const support = new Support({
      userId,
      subject,
      message,
      status: status || "open"
    });

    await support.save();
    res.status(201).json({ message: "Support ticket created successfully", support });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Support Tickets
exports.getSupports = async (req, res) => {
  try {
    const supports = await Support.find()
      .populate('userId', 'fullName email');
    res.status(200).json(supports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Support Ticket by ID
exports.getSupportById = async (req, res) => {
  try {
    const support = await Support.findById(req.params.id)
      .populate('userId', 'fullName email');
    if (!support) return res.status(404).json({ message: "Support ticket not found" });
    res.status(200).json(support);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Support Ticket
exports.updateSupport = async (req, res) => {
  try {
    const updates = req.body;
    const support = await Support.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!support) return res.status(404).json({ message: "Support ticket not found" });

    res.status(200).json({ message: "Support ticket updated", support });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Support Ticket
exports.deleteSupport = async (req, res) => {
  try {
    const support = await Support.findByIdAndDelete(req.params.id);
    if (!support) return res.status(404).json({ message: "Support ticket not found" });

    res.status(200).json({ message: "Support ticket deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
