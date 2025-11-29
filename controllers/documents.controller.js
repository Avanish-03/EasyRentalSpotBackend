const Document = require('../models/Document');

// Create Document
exports.createDocument = async (req, res) => {
  try {
    const { userId, propertyId, name, url, type } = req.body;

    const document = new Document({
      userId,
      propertyId,
      name,
      url,
      type
    });

    await document.save();
    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Document
exports.updateDocument = async (req, res) => {
  try {
    const updates = req.body;
    const document = await Document.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!document) return res.status(404).json({ message: "Document not found" });

    res.status(200).json({ message: "Document updated", document });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });

    res.status(200).json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
