'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Panel, PanelTitle } from '@/components/admin/ui';
import { useTranslations } from 'next-intl';

type Point = { name: string; value: number };

/** Categorical palette: brand red first, then distinguishable hues. */
const PALETTE = [
  '#C42A21',
  '#0E7490',
  '#B45309',
  '#4338CA',
  '#15803D',
  '#9D174D',
  '#0F766E',
  '#7C2D12',
  '#1D4ED8',
];

const axisProps = {
  stroke: 'currentColor',
  tickLine: false,
  axisLine: false,
  style: { fontSize: 11, opacity: 0.65 },
} as const;

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <div className="h-56 w-full text-admin-muted">{children}</div>
    </Panel>
  );
}

function EmptyChart() {
  const t = useTranslations('admin');
  return <div className="grid h-full place-items-center text-sm">{t('charts.noData')}</div>;
}

export function LeadsPerDayChart({ data }: { data: { date: string; count: number }[] }) {
  const t = useTranslations('admin');
  const hasData = data.some((point) => point.count > 0);
  return (
    <ChartFrame title={t('charts.leadsPerDay')}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              opacity={0.15}
              vertical={false}
            />
            <XAxis dataKey="date" interval={4} {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={PALETTE[0]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartFrame>
  );
}

export function LeadsBySourceChart({ data }: { data: Point[] }) {
  const t = useTranslations('admin');
  return (
    <ChartFrame title={t('charts.bySource')}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartFrame>
  );
}

export function SimpleBarChart({
  title,
  data,
  color = PALETTE[1],
}: {
  title: string;
  data: Point[];
  color?: string;
}) {
  return (
    <ChartFrame title={title}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              opacity={0.15}
              horizontal={false}
            />
            <XAxis type="number" allowDecimals={false} {...axisProps} />
            <YAxis type="category" dataKey="name" width={120} {...axisProps} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ opacity: 0.08 }} />
            <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartFrame>
  );
}

export function ScoreHistogram({ data }: { data: { label: string; count: number }[] }) {
  const t = useTranslations('admin');
  const hasData = data.some((bucket) => bucket.count > 0);
  return (
    <ChartFrame title={t('charts.scores')}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              opacity={0.15}
              vertical={false}
            />
            <XAxis dataKey="label" interval={1} {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ opacity: 0.08 }} />
            <Bar dataKey="count" fill={PALETTE[3]} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartFrame>
  );
}
