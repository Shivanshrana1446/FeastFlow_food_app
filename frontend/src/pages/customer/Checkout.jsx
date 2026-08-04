import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCart, resetCart } from '@/features/cart/cartSlice';
import { selectCurrentUser, updateCurrentUser } from '@/features/auth/authSlice';
import { userApi } from '@/api/userApi';
import { orderApi } from '@/api/orderApi';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import AddressForm from '@/components/common/AddressForm';
import { formatCurrency } from '@/utils/format';
import { PAYMENT_METHOD, PAYMENT_METHOD_LABEL } from '@/utils/constants';
import { openRazorpayCheckout } from '@/utils/razorpay';

function AddAddressForm({ onSaved }) {
  const dispatch = useAppDispatch();
  const notify = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const user = await userApi.addAddress(values);
      dispatch(updateCurrentUser(user));
      onSaved(user.addresses[user.addresses.length - 1]);
      notify('Address saved', 'success');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return <AddressForm onSubmit={handleSave} submitting={saving} className="mt-4 rounded-xl border border-dashed border-ink-200 p-4" />;
}

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const cart = useAppSelector(selectCart);
  const user = useAppSelector(selectCurrentUser);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.CASH_ON_DELIVERY);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!cart || cart.items.length === 0) navigate('/cart', { replace: true });
  }, [cart, navigate]);

  useEffect(() => {
    const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddress) setSelectedAddressId(defaultAddress._id);
    else setShowAddForm(user?.addresses?.length === 0);
  }, [user]);

  if (!cart || cart.items.length === 0) return null;

  const subtotal = cart.items.reduce((sum, item) => {
    const addOnsTotal = (item.addOns || []).reduce((s, a) => s + a.price, 0);
    return sum + (item.price + addOnsTotal) * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    const address = user.addresses.find((a) => a._id === selectedAddressId);
    if (!address) return notify('Please select a delivery address', 'error');

    setPlacing(true);
    try {
      const { order, payment, razorpayOrder, razorpayKeyId } = await orderApi.placeOrder({
        deliveryAddress: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
      });
      dispatch(resetCart());

      // The order already exists at this point regardless of what happens with Razorpay next —
      // reopening the checkout modal (or trying again later) is handled by the receipt page, not
      // by staying here, since re-submitting this form would create a second, duplicate order.
      if (paymentMethod !== PAYMENT_METHOD.RAZORPAY) {
        navigate(`/payment/${order._id}`, { state: { order, payment } });
        return;
      }

      try {
        const result = await openRazorpayCheckout({
          razorpayOrder,
          keyId: razorpayKeyId,
          user,
          description: `Order from ${cart.restaurant?.name || 'FeastFlow'}`,
        });
        const verifiedPayment = await orderApi.verifyRazorpayPayment({
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        });
        navigate(`/payment/${order._id}`, { state: { order, payment: verifiedPayment } });
      } catch {
        // Dismissed the modal or the payment failed — the order is still there, unpaid; let the
        // receipt page offer a retry instead of losing the order entirely.
        notify('Payment was not completed. You can finish paying from your order page.', 'info');
        navigate(`/payment/${order._id}`, { state: { order, payment } });
      }
    } catch (err) {
      notify(errorMessage(err, 'Could not place order'), 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Checkout</h1>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <Icon name="mapPin" className="h-4.5 w-4.5 text-brand-500" />
          Delivery address
        </h2>

        {user?.addresses?.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {user.addresses.map((address) => (
              <label
                key={address._id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  selectedAddressId === address._id ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:bg-ink-50'
                }`}
              >
                <input
                  type="radio"
                  className="mt-1 accent-brand-500"
                  checked={selectedAddressId === address._id}
                  onChange={() => setSelectedAddressId(address._id)}
                />
                <div>
                  <p className="text-sm font-semibold text-ink-800">{address.label || 'Address'}</p>
                  <p className="text-xs text-ink-500">
                    {address.line1}, {address.line2 ? `${address.line2}, ` : ''}
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add a new address
          </button>
        ) : (
          <AddAddressForm
            onSaved={(address) => {
              setSelectedAddressId(address._id);
              setShowAddForm(false);
            }}
          />
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <Icon name="creditCard" className="h-4.5 w-4.5 text-brand-500" />
          Payment method
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Object.values(PAYMENT_METHOD).map((method) => (
            <label
              key={method}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium transition-colors ${
                paymentMethod === method ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              <input type="radio" className="accent-brand-500" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
              {PAYMENT_METHOD_LABEL[method]}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="font-display text-base font-bold text-ink-900">Order summary</h2>
        <div className="mt-3 space-y-1.5 text-sm text-ink-600">
          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span>{formatCurrency((item.price + (item.addOns || []).reduce((s, a) => s + a.price, 0)) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-ink-100 pt-3 text-sm font-bold text-ink-900">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-500">Tax and delivery fee will be added to your final total.</p>
      </section>

      <Button className="mt-6 w-full" onClick={handlePlaceOrder} loading={placing} disabled={!selectedAddressId}>
        {paymentMethod === PAYMENT_METHOD.RAZORPAY ? 'Proceed to pay' : 'Place order'}
      </Button>

      {!user?.addresses?.length && !showAddForm && (
        <EmptyState className="mt-6" icon="mapPin" title="Add a delivery address to continue" />
      )}
    </PageTransition>
  );
}
