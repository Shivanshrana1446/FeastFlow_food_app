import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  info: 'bg-info-50 text-info-700',
  ink: 'bg-ink-100 text-ink-700',
};

export default function StatCard({ icon, label, value, tone = 'brand', trend }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-ink-900">{value}</p>
          {trend && (
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${trend.positive ? 'text-success-600' : 'text-danger-600'}`}>
              <Icon name="trendingUp" className={`h-3.5 w-3.5 ${trend.positive ? '' : 'rotate-90'}`} />
              {trend.label}
            </p>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
