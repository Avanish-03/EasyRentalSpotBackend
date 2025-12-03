const Subscription = require("../models/Subscription");
const dayjs = require("dayjs");

// Helper to calculate endDate
function getEndDate(planType) {
  if (planType === "monthly") return dayjs().add(1, "month");
  if (planType === "quarterly") return dayjs().add(3, "month");
  if (planType === "yearly") return dayjs().add(12, "month");
  return dayjs().add(1, "month");
}

// CREATE / RENEW subscription
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planName, planType, amount } = req.body;

    if (!planName || !planType || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Find active previous subscription
    const activeSub = await Subscription.findOne({
      userId,
      isActive: true,
      endDate: { $gte: new Date() }
    });

    let startDate = dayjs();
    let endDate = getEndDate(planType);

    // If already active → extend end date
    if (activeSub) {
      startDate = dayjs(activeSub.endDate); // extend from end
      endDate =
        planType === "monthly"
          ? dayjs(activeSub.endDate).add(1, "month")
          : planType === "quarterly"
          ? dayjs(activeSub.endDate).add(3, "month")
          : dayjs(activeSub.endDate).add(12, "month");

      // deactivate old sub
      activeSub.isActive = false;
      await activeSub.save();
    }

    const subscription = await Subscription.create({
      userId,
      planName,
      planType,
      amount,
      startDate,
      endDate,
      currency: "INR",
      paymentStatus: "paid",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription activated",
      subscription,
    });
  } catch (err) {
    console.log("Subscription Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ACTIVE SUBSCRIPTION
exports.getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const sub = await Subscription.findOne({
      userId,
      isActive: true,
      endDate: { $gte: new Date() }
    });

    if (!sub) {
      return res.json({ success: true, active: false, subscription: null });
    }

    return res.json({ success: true, active: true, subscription: sub });
  } catch (err) {
    console.log("Active subscription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// SUBSCRIPTION HISTORY
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Subscription.find({ userId }).sort("-createdAt");

    res.json({ success: true, history });
  } catch (err) {
    console.log("History error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const list = await Subscription.find()
      .populate("userId", "fullName email")
      .sort("-createdAt");

    res.json({ success: true, list });
  } catch (err) {
    console.log("Admin subscription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
