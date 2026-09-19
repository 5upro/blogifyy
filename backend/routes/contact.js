const express = require('express');

const router = express.Router();

// Contact submissions are currently handled directly by Web3Forms on frontend.
// Keep this route mounted so backend startup does not break.
router.post('/', (req, res) => {
  return res.status(501).json({
    message: 'Contact endpoint is not active on backend. Use Web3Forms integration from frontend.'
  });
});

module.exports = router;