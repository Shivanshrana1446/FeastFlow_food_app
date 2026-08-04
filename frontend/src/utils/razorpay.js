const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loadPromise = null;

/** Lazily injects Razorpay's checkout widget script — only when a customer actually pays online. */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Could not load the payment widget. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

/**
 * Opens Razorpay's checkout widget for an order created via POST /orders (or a retry of one
 * still pending payment). Resolves with the raw Razorpay response on success; the caller is
 * responsible for sending it to POST /payments/razorpay/verify.
 */
export async function openRazorpayCheckout({ razorpayOrder, keyId, user, description }) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: 'FeastFlow',
      description,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: '#FF4D2D' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('DISMISSED')),
      },
    });
    razorpay.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed')));
    razorpay.open();
  });
}
