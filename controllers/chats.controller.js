const Chat = require('../models/Chat');

// Create Chat
exports.createChat = async (req, res) => {
  try {
    const { senderId, receiverId, message, propertyId } = req.body;

    const chat = new Chat({
      senderId,
      receiverId,
      message,
      propertyId
    });

    await chat.save();
    res.status(201).json({ message: "Chat created successfully", chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('senderId', 'fullName email')
      .populate('receiverId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('senderId', 'fullName email')
      .populate('receiverId', 'fullName email')
      .populate('propertyId', 'title');
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Chat
exports.updateChat = async (req, res) => {
  try {
    const updates = req.body;
    const chat = await Chat.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.status(200).json({ message: "Chat updated", chat });
