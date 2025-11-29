const AdminAction = require('../models/AdminAction');

// Create Admin Action
exports.createAdminAction = async (req, res) => {
  try {
    const { adminId, actionType, description, targetId } = req.body;

    const adminAction = new AdminAction({
      adminId,
      actionType,
      description,
      targetId
    });

    await adminAction.save();
    res.status(201).json({ message: "Admin action logged successfully", adminAction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Admin Actions
exports.getAdminActions = async (req, res) => {
  try {
    const actions = await AdminAction.find()
      .populate('adminId', 'fullName email');
    res.status(200).json(actions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Admin Action by ID
exports.getAdminActionById = async (req, res) => {
  try {
    const action = await AdminAction.findById(req.params.id)
      .populate('adminId', 'fullName email');
    if (!action) return res.status(404).json({ message: "Admin action not found" });
    res.status(200).json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Admin Action
exports.updateAdminAction = async (req, res) => {
  try {
    const updates = req.body;
    const action = await AdminAction.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!action) return res.status(404).json({ message: "Admin action not found" });

    res.status(200).json({ message: "Admin action updated", action });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Admin Action
exports.deleteAdminAction = async (req, res) => {
  try {
    const action = await AdminAction.findByIdAndDelete(req.params.id);
    if (!action) return res.status(404).json({ message: "Admin action not found" });

    res.status(200).json({ message: "Admin action deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
