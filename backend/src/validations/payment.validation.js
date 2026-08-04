const { z } = require('zod');

const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

module.exports = { verifyRazorpayPaymentSchema };
