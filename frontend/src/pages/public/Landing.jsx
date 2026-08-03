import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import PageTransition from '@/components/common/PageTransition';

const CATEGORIES = [
  { label: 'Pizza', icon: 'utensils' },
  { label: 'Burgers', icon: 'utensils' },
  { label: 'Biryani', icon: 'utensils' },
  { label: 'Chinese', icon: 'utensils' },
  { label: 'Desserts', icon: 'heart' },
  { label: 'Healthy', icon: 'trendingUp' },
];

const STEPS = [
  { icon: 'search', title: 'Find your craving', text: 'Browse thousands of restaurants, filtered by cuisine, rating, and price.' },
  { icon: 'cart', title: 'Order in seconds', text: 'Build your cart, choose add-ons, and check out with saved addresses.' },
  { icon: 'bike', title: 'Track live', text: 'Watch your order move from the kitchen to your door in real time.' },
];

const HIGHLIGHTS = [
  { icon: 'clock', title: '30-min delivery', text: 'Most orders arrive hot and on time, tracked door to door.' },
  { icon: 'shield', title: 'Verified restaurants', text: 'Every partner is vetted by our team before going live.' },
  { icon: 'percent', title: 'Everyday value', text: 'Transparent pricing with no hidden delivery surprises.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(city ? `/restaurants?city=${encodeURIComponent(city)}` : '/restaurants');
  };

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-bold text-brand-700">
                <Icon name="starFilled" className="h-3.5 w-3.5" />
                Rated 4.8 by 2M+ food lovers
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
                Food you love,
                <br />
                delivered <span className="text-brand-500">fast.</span>
              </h1>
              <p className="mt-5 max-w-md text-base text-ink-500">
                Order from the best restaurants near you — fresh, hot, and tracked live from kitchen to doorstep.
              </p>

              <form onSubmit={handleSearch} className="mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-card">
                <Icon name="mapPin" className="ml-2 h-5 w-5 shrink-0 text-brand-500" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your delivery address"
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-500"
                />
                <Button type="submit" size="sm">
                  Find food
                </Button>
              </form>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="store" className="h-4.5 w-4.5 text-brand-500" /> 12,000+ restaurants
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="bike" className="h-4.5 w-4.5 text-brand-500" /> 5,000+ delivery partners
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto aspect-square w-full max-w-md"
            >
              <div className="absolute inset-6 rounded-full bg-brand-200/60 blur-3xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-[2.5rem] bg-white shadow-lifted">
                <Icon name="utensils" className="h-28 w-28 text-brand-500" strokeWidth={1.2} />
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 top-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lifted"
              >
                <Icon name="checkCircle" className="h-5 w-5 text-success-500" />
                <div>
                  <p className="text-xs font-bold text-ink-900">Order confirmed</p>
                  <p className="text-2xs text-ink-500">Arriving in 22 min</p>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-2 bottom-12 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lifted"
              >
                <Icon name="starFilled" className="h-5 w-5 text-warning-500" />
                <p className="text-xs font-bold text-ink-900">4.9 rating</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-bold text-ink-900">What are you craving?</h2>
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate('/restaurants')}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon name={cat.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">How FeastFlow works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
                  <Icon name={step.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/60">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.title} className="p-6" hoverable>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={h.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">{h.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{h.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Partner CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 overflow-hidden rounded-3xl bg-brand-500 p-10 text-white sm:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl font-bold">Own a restaurant?</h3>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Reach thousands of hungry customers, manage your menu, and track orders in real time.
            </p>
            <Button variant="secondary" className="mt-5" to="/signup">
              Partner with us
            </Button>
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold">Deliver with us</h3>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Flexible hours, weekly payouts, and a simple app to manage every delivery.
            </p>
            <Button variant="secondary" className="mt-5" to="/signup">
              Become a rider
            </Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
