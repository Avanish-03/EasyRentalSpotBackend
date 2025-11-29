const Subscription = require('../models/Subscription');

// Create Subscription
exports.createSubscription = async (req, res) => {
  try {
    const { userId, plan, startDate, endDate, status } = req.body;

    const subscription = new Subscription({
      userId,
      plan,
      startDate,
      endDate,
      status: status || "active"
    });

    await subscription.save();
    res.status(201).json({ message: "Subscription created successfully", subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'fullName email');
    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('userId', 'fullName email');
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Subscription
exports.updateSubscription = async (req, res) => {
  try {
    const updates = req.body;
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    res.status(200).json({ message: "Subscription updated", subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    res.status(200).json({ message: "Subscription deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
