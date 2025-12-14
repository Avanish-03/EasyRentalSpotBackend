const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");

// GET all tickets (admin)
exports.getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search = "",
      sort = "-createdAt"
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    // Search in subject or user name/email
    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" }},
          { email: { $regex: search, $options: "i" }}
        ]
      }).select("_id");

      filters.$or = [
        { subject: { $regex: search, $options: "i" }},
        { userId: { $in: users.map(u => u._id) }}
      ];
    }

    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(filters)
      .populate("userId", "fullName email")
      .populate("assignedTo", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      tickets
    });

  } catch (err) {
    console.error("getAllTickets:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET single ticket
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("assignedTo", "fullName email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.json({ success: true, ticket });

  } catch (err) {
    console.error("getTicketById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    ticket.status = status;

    await ticket.save();

    res.json({ success: true, message: "Status updated", ticket });

  } catch (err) {
    console.error("updateTicketStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Admin assignment
exports.assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    ticket.assignedTo = adminId;
    ticket.status = "in_progress";

    await ticket.save();

    res.json({ success: true, message: "Ticket assigned", ticket });

  } catch (err) {
    console.error("assignTicket:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const deleted = await SupportTicket.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    res.json({ success: true, message: "Ticket deleted" });

  } catch (err) {
    console.error("deleteTicket:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
