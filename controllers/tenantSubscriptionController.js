const Subscription = require("../models/Subscription");
const plans = require("../config/subscriptionPlans");
const dayjs = require("dayjs");

// Get all available plans
exports.getPlans = async (req, res) => {
  try {
    return res.json({ success: true, plans });
  } catch (err) {
    console.error("getPlans error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get my current subscription
exports.getMySubscription = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const sub = await Subscription.findOne({
      userId: tenantId,
      endDate: { $gte: new Date() }
    });

    if (!sub) return res.json({ success: true, active: false });

    res.json({
      success: true,
      active: true,
      subscription: sub
    });

  } catch (err) {
    console.error("getMySubscription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Purchase a subscription
exports.purchaseSubscription = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { planId } = req.body;

    if (!planId)
      return res.status(400).json({ success: false, message: "planId required" });

    const plan = plans.find((p) => p.id === planId);
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    // End active subscription
    await Subscription.updateMany(
      { userId: tenantId, endDate: { $gte: new Date() } },
      { $set: { endDate: new Date() } }
    );

    const startDate = new Date();
    const endDate = dayjs(startDate).add(plan.durationDays, "day").toDate();

    const newSub = await Subscription.create({
      userId: tenantId,
      planName: plan.name,
      planType: plan.planType,
      startDate,
      endDate,
      amount: plan.price,
      currency: "INR",
      paymentStatus: "paid" // final payment integration later
    });

    return res.json({
      success: true,
      message: "Subscription activated",
      subscription: newSub
    });

  } catch (err) {
    console.error("purchaseSubscription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const sub = await Subscription.findOne({
      userId: tenantId,
      endDate: { $gte: new Date() }
    });

    if (!sub)
      return res.status(404).json({ success: false, message: "No active subscription" });

    // End today
    sub.endDate = new Date();
    await sub.save();

    res.json({ success: true, message: "Subscription cancelled" });

  } catch (err) {
    console.error("cancelSubscription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
