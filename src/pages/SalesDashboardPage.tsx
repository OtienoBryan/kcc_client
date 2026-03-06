import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell
} from 'recharts';
import { API_CONFIG } from '../config/api';
import {
  TrendingUpIcon, UsersIcon, ShoppingCartIcon,
  BarChart3Icon, PieChartIcon, CalendarIcon, MapPinIcon, FileTextIcon,
  X, RefreshCwIcon, ChevronRightIcon, ClipboardListIcon, ActivityIcon,
  CheckCircle2Icon, AlertCircleIcon, ArrowUpRightIcon,
} from 'lucide-react';

/* ──────────────────────────── StatCard ──────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  gradient: string;
  onClick?: () => void;
  subText?: string;
}

const StatCard: React.FC<StatCardProps> = memo(({
  title, value, icon, prefix = '', suffix = '', gradient, onClick, subText
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl shadow-md cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${gradient}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {/* Background decoration */}
    <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white opacity-10" />
    <div className="absolute -right-1 -bottom-4 w-28 h-28 rounded-full bg-white opacity-5" />

    <div className="relative p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-widest mb-0.5 truncate">
            {title}
          </p>
          <p className="text-xl font-bold text-white leading-tight truncate">
            {prefix}{value}
          </p>
          {suffix && (
            <p className="text-[10px] text-white/70 mt-0.5">{suffix}</p>
          )}
          {subText && (
            <p className="text-[10px] text-white/60 mt-0.5 truncate">{subText}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            {icon}
          </div>
        </div>
      </div>
      {onClick && (
        <div className="flex items-center mt-2 text-white/70 group-hover:text-white transition-colors">
          <span className="text-[9px] font-medium">View details</span>
          <ArrowUpRightIcon className="h-2.5 w-2.5 ml-0.5" />
        </div>
      )}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

/* ──────────────────────────── Skeleton ──────────────────────────── */
const SkeletonCard = memo(() => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/4" />
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

const SkeletonChart = memo(() => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="h-56 bg-gray-100 rounded-xl" />
  </div>
));
SkeletonChart.displayName = 'SkeletonChart';

/* ──────────────────────────── Main Page ──────────────────────────── */
const SalesDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalSales: 0, outletsVisitedThisMonth: 0, totalOrders: 0, activeReps: 0,
    checkedInReps: 0, totalActiveReps: 0, avgPerformance: 0,
  });
  const [planogramComplianceData, setPlanogramComplianceData] = useState<{ month: string; compliance: number }[]>([]);
  const [topReps, setTopReps] = useState<{ name: string; overall: number }[]>([]);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [outletsVisited, setOutletsVisited] = useState<{ month: string; outlets: number }[]>([]);
  const [ordersSummary, setOrdersSummary] = useState<{ month: string; quantity: number }[]>([]);

  // Checked-in reps modal
  const [activeRepsModalOpen, setActiveRepsModalOpen] = useState(false);
  const [activeSalesReps, setActiveSalesReps] = useState<Array<{
    id: number; name: string; email?: string;
    route_name?: string; region_name?: string; checkInTime?: string;
  }>>([]);
  const [loadingActiveReps, setLoadingActiveReps] = useState(false);

  const navigate = useNavigate();

  /* ── fetch helper ── */
  const fetchData = useCallback(async (endpoint: string, params?: any) => {
    const url = new URL(API_CONFIG.getUrl(endpoint), window.location.origin);
    if (params) Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  /* ── core data ── */
  const fetchCoreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData('/dashboard/sales-dashboard-data');
      if (result.success && result.data) {
        const d = result.data;
        setStats(d.stats);
        setPlanogramComplianceData(d.planogramComplianceData || []);
        setTopReps(d.topReps || []);
        setPendingLeavesCount(d.pendingLeavesCount || 0);
        setNewOrdersCount(d.newOrdersCount || 0);
      }
    } catch (e: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  /* ── charts data ── */
  const fetchChartsData = useCallback(async () => {
    try {
      const [outletsResult, ordersSummaryResult] = await Promise.all([
        fetchData('/dashboard/outlets-visited'),
        fetchData('/dashboard/orders-summary')
      ]);
      if (outletsResult.success && outletsResult.data) {
        setOutletsVisited(outletsResult.data || []);
      }
      if (ordersSummaryResult.success && ordersSummaryResult.data) {
        setOrdersSummary(ordersSummaryResult.data || []);
      }
    } catch {
      // charts are non-critical
    } finally {
      setChartsLoading(false);
    }
  }, [fetchData]);

  useEffect(() => { fetchCoreData(); }, [fetchCoreData]);
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(fetchChartsData, 100);
      return () => clearTimeout(t);
    }
  }, [loading, fetchChartsData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setChartsLoading(true);
    await fetchCoreData();
    setRefreshing(false);
  }, [fetchCoreData]);

  /* ── checked-in reps ── */
  const fetchActiveSalesReps = useCallback(async () => {
    setLoadingActiveReps(true);
    try {
      const result = await fetchData('/dashboard/checked-in-sales-reps');
      if (result.success && result.data) {
        const reps = Array.isArray(result.data) ? result.data : [];
        setActiveSalesReps(
          [...reps].sort((a: any, b: any) =>
            new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
          )
        );
      } else {
        setActiveSalesReps([]);
      }
    } catch {
      setActiveSalesReps([]);
    } finally {
      setLoadingActiveReps(false);
    }
  }, [fetchData]);

  const openActiveRepsModal = useCallback(() => {
    setActiveRepsModalOpen(true);
    fetchActiveSalesReps();
  }, [fetchActiveSalesReps]);

  /* ── navigation ── */
  const navGroups = useMemo(() => [
    {
      label: 'People',
      items: [
        { to: '/sales-reps', label: 'Sales Reps', icon: <UsersIcon className="h-4 w-4" />, color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
        { to: '/dashboard/route-compliance', label: 'Rep Compliance', icon: <CheckCircle2Icon className="h-4 w-4" />, color: 'bg-lime-50 text-lime-700 border-lime-100 hover:bg-lime-100' },
        { to: '/sales-rep-leaves', label: 'Rep Leaves', icon: <CalendarIcon className="h-4 w-4" />, color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100', badge: pendingLeavesCount },
        { to: '/sales-rep-working-days', label: 'Working Days', icon: <ClipboardListIcon className="h-4 w-4" />, color: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100' },
        { to: '/sales-rep-attendance', label: 'Rep Attendance', icon: <BarChart3Icon className="h-4 w-4" />, color: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { to: '/products', label: 'Products', icon: <ShoppingCartIcon className="h-4 w-4" />, color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
        { to: '/clients-list', label: 'Outlets', icon: <MapPinIcon className="h-4 w-4" />, color: 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100' },
        { to: '/routes', label: 'Routes', icon: <MapPinIcon className="h-4 w-4" />, color: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100' },
        { to: '/dashboard/journey-plans', label: 'Route Plans', icon: <ActivityIcon className="h-4 w-4" />, color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
        { to: '/visits', label: 'Visit Reports', icon: <MapPinIcon className="h-4 w-4" />, color: 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100' },
      ],
    },
    {
      label: 'Reports & Analytics',
      items: [
        { to: '/shared-performance', label: 'Rep Performance', icon: <TrendingUpIcon className="h-4 w-4" />, color: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' },
        { to: '/overall-attendance', label: 'Sales Rep Report', icon: <BarChart3Icon className="h-4 w-4" />, color: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100' },
        { to: '/dashboard/reports/product-performance', label: 'Product Perf.', icon: <PieChartIcon className="h-4 w-4" />, color: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100' },
        { to: '/financial/customer-orders', label: 'Orders Report', icon: <FileTextIcon className="h-4 w-4" />, color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100', badge: newOrdersCount },
        { to: '/notices', label: 'Notices', icon: <FileTextIcon className="h-4 w-4" />, color: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100' },
      ],
    },
  ], [pendingLeavesCount, newOrdersCount]);


  const checkedInPct = stats.totalActiveReps > 0
    ? ((stats.checkedInReps || 0) / stats.totalActiveReps * 100).toFixed(1)
    : '0.0';

  /* ── loading / error ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="w-full">
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <AlertCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Failed to load dashboard</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={handleRefresh} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────── RENDER ──────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Banner ── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 lg:px-8 py-4">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">NKCC</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 py-5 space-y-5">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Outlets Visited"
            value={Number(stats.outletsVisitedThisMonth || 0).toLocaleString()}
            icon={<MapPinIcon className="h-4 w-4 text-white" />}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            onClick={() => navigate('/visits')}
            subText="This month"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon className="h-4 w-4 text-white" />}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            onClick={() => navigate('/dashboard/reports/sales-report')}
            subText="This month"
          />
          <StatCard
            title="Checked-In Reps"
            value={`${stats.checkedInReps || 0} / ${stats.totalActiveReps || 0}`}
            icon={<UsersIcon className="h-4 w-4 text-white" />}
            suffix={`${checkedInPct}% of active reps`}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            onClick={openActiveRepsModal}
          />
          <StatCard
            title="Avg Performance"
            value={`${stats.avgPerformance}%`}
            icon={<TrendingUpIcon className="h-5 w-5 text-white" />}
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
            onClick={() => navigate('/shared-performance')}
            subText="Overall score"
          />
        </div>

        {/* ── Quick Navigation ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Access</h2>
          <div className="space-y-3">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.to}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 hover:scale-105 hover:shadow-sm ${item.color}`}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Planogram Compliance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Planogram Compliance</h2>
                <p className="text-xs text-gray-400 mt-0.5">Overall compliance trend</p>
              </div>
              <button
                onClick={() => navigate('/planogram-compliance-report')}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Details <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>
            {planogramComplianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={planogramComplianceData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Compliance']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <PieChartIcon className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">No compliance data available</p>
              </div>
            )}
          </div>

          {/* Outlets Visited */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MapPinIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Outlets Visited</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Unique outlets visited per month</p>
                </div>
              </div>
              {outletsVisited.length > 0 && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-indigo-600">
                    {outletsVisited.reduce((sum, item) => sum + item.outlets, 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">Total outlets</p>
                </div>
              )}
            </div>
            {chartsLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : outletsVisited.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={outletsVisited} margin={{ top: 12, right: 20, left: -10, bottom: 8 }}>
                  <defs>
                    <linearGradient id="outletsBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="outletsBarGradientHover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.9} />
                    </linearGradient>
                    <filter id="outletsShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                      <feOffset dx="0" dy="2" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toLocaleString()}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">{payload[0].payload.month}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                              <p className="text-sm font-bold text-gray-900">
                                {payload[0].value?.toLocaleString()} <span className="text-xs font-normal text-gray-500">outlets</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="outlets" 
                    fill="url(#outletsBarGradient)" 
                    radius={[8, 8, 0, 0]}
                    filter="url(#outletsShadow)"
                  >
                    {outletsVisited.map((entry: any, index: number) => {
                      const maxValue = Math.max(...outletsVisited.map((e: any) => e.outlets));
                      const isMax = entry.outlets === maxValue;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isMax ? "url(#outletsBarGradientHover)" : "url(#outletsBarGradient)"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <MapPinIcon className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-xs font-medium">No outlets visited data available</p>
                <p className="text-[10px] text-gray-400 mt-1">Data will appear here once visits are recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orders Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#088F8F' }}>
                  <ShoppingCartIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Orders Summary</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Total quantity ordered per month</p>
                </div>
              </div>
              {ordersSummary.length > 0 && (
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: '#088F8F' }}>
                    {ordersSummary.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">Total quantity</p>
                </div>
              )}
            </div>
            {chartsLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#088F8F' }} />
              </div>
            ) : ordersSummary.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ordersSummary} margin={{ top: 12, right: 20, left: -10, bottom: 8 }}>
                  <defs>
                    <filter id="ordersShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                      <feOffset dx="0" dy="2" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toLocaleString()}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">{payload[0].payload.month}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#088F8F' }}></div>
                              <p className="text-sm font-bold text-gray-900">
                                {payload[0].value?.toLocaleString()} <span className="text-xs font-normal text-gray-500">units</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="#088F8F" 
                    radius={[8, 8, 0, 0]}
                    filter="url(#ordersShadow)"
                  >
                    {ordersSummary.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="#088F8F"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <ShoppingCartIcon className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-xs font-medium">No orders summary data available</p>
                <p className="text-[10px] text-gray-400 mt-1">Data will appear here once orders are recorded</p>
              </div>
            )}
          </div>

          {/* Top 10 Sales Reps */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Top 10 Sales Reps</h2>
                <p className="text-xs text-gray-400 mt-0.5">Overall performance score</p>
              </div>
              <button
                onClick={() => navigate('/shared-performance')}
                className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Details <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>
            {topReps.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topReps} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Performance']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: 12 }}
                  />
                  <Bar dataKey="overall" fill="#f59e0b" name="Overall %" radius={[0, 4, 4, 0]}>
                    {topReps.map((_: any, i: number) => (
                      <Cell key={i} fill={i < 3 ? '#f59e0b' : '#fbbf24'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <BarChart3Icon className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">No sales reps data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────── Checked-In Reps Modal ──────────── */}
      {activeRepsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Checked-In Sales Reps</h2>
                  <p className="text-xs text-purple-200">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRepsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Summary strip */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-purple-50 border-b border-purple-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-purple-800 text-lg leading-none">{activeSalesReps.length}</span>
                <span className="text-xs text-purple-600">reps checked in today</span>
                {stats.totalActiveReps > 0 && (
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-bold rounded-full">
                    {checkedInPct}% attendance
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {loadingActiveReps ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mb-4" />
                  <p className="text-sm">Loading checked-in reps...</p>
                </div>
              ) : activeSalesReps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <AlertCircleIcon className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No reps have checked in today</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {['#', 'Name', 'Check-In', 'Route', 'Region'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeSalesReps.map((rep, idx) => {
                      const checkInTime = rep.checkInTime
                        ? new Date(rep.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—';
                      const isEarly = rep.checkInTime
                        ? new Date(rep.checkInTime).getHours() < 8
                        : false;
                      return (
                        <tr key={rep.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-400 w-8">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[10px] font-bold flex-shrink-0">
                                {rep.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-800 font-medium whitespace-nowrap">{rep.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold ${isEarly ? 'text-emerald-600' : 'text-orange-500'}`}>
                              {checkInTime}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{rep.route_name || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{rep.region_name || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setActiveRepsModalOpen(false); navigate('/sales-reps', { state: { filterStatus: '1' } }); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-purple-200 rounded-xl text-xs font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
              >
                View All Active Reps <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setActiveRepsModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboardPage;
