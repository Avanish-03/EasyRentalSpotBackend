const Report = require('../models/Report');

// Create Report
exports.createReport = async (req, res) => {
  try {
    const { userId, propertyId, type, description, status } = req.body;

    const report = new Report({
      userId,
      propertyId,
      type,
      description,
      status: status || "pending"
    });

    await report.save();
    res.status(201).json({ message: "Report created successfully", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Report
exports.updateReport = async (req, res) => {
  try {
    const updates = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json({ message: "Report updated", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
