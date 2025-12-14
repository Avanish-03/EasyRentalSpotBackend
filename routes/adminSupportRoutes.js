//routes/adminSupportRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminSupportController");

router.get("/", auth(), adminOnly, ctrl.getAllTickets);
router.get("/:id", auth(), adminOnly, ctrl.getTicketById);

router.put("/:id/status", auth(), adminOnly, ctrl.updateTicketStatus);
router.put("/:id/assign", auth(), adminOnly, ctrl.assignTicket);

router.delete("/:id", auth(), adminOnly, ctrl.deleteTicket);

module.exports = router;
