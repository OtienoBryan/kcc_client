import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  MessageSquare, 
  Package,
  FileText,
  Calendar,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Target,
  MapPin,
  BarChart3
} from 'lucide-react';

interface VisitLink {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  headerColor: string;
  features: string[];
}

const VisitsIndexPage: React.FC = () => {
  const navigate = useNavigate();

  const visits: VisitLink[] = [
    {
      id: 'my-visibility',
      title: 'My Visibility',
      description: 'View your own visibility reports and visit records from your sales activities. Track product placement and visibility metrics.',
      path: '/my-visibility',
      icon: <Eye className="w-4 h-4" />,
      headerColor: 'bg-purple-500',
      features: [
        'Personal visibility reports',
        'Visit date tracking',
        'Product placement metrics',
        'Image uploads and comments',
        'Date range filtering'
      ]
    },
    {
      id: 'feedback-reports',
      title: 'Feedback Reports',
      description: 'View detailed feedback reports and client insights from visits. Understand client needs and preferences.',
      path: '/feedback-reports',
      icon: <MessageSquare className="w-4 h-4" />,
      headerColor: 'bg-green-500',
      features: [
        'Client feedback collection',
        'Visit comments and notes',
        'Sales rep performance',
        'Date and outlet filtering',
        'Search functionality',
        'Report export'
      ]
    },
    {
      id: 'availability-reports',
      title: 'Availability Reports',
      description: 'Track product availability and inventory status from visit reports. Monitor stock levels across outlets.',
      path: '/availability-reports',
      icon: <Package className="w-4 h-4" />,
      headerColor: 'bg-orange-500',
      features: [
        'Product availability tracking',
        'Quantity reporting',
        'Category-based filtering',
        'Country and outlet filters',
        'Date range selection',
        'CSV export support'
      ]
    },
    {
      id: 'short-expiry-report',
      title: 'Short Expiry Report',
      description: 'View products with short expiry dates from visit reports. Monitor batch numbers and expiry tracking.',
      path: '/short-expiry-report',
      icon: <Calendar className="w-4 h-4" />,
      headerColor: 'bg-red-500',
      features: [
        'Expiry date tracking',
        'Batch number monitoring',
        'Product quantity reporting',
        'Outlet and sales rep filters',
        'Date range selection',
        'CSV export support'
      ]
    },
    {
      id: 'price-compliance-report',
      title: 'Price Compliance Report',
      description: 'Monitor pricing compliance, RRP vs shelf price, and promotional pricing across outlets.',
      path: '/price-compliance-report',
      icon: <DollarSign className="w-4 h-4" />,
      headerColor: 'bg-emerald-500',
      features: [
        'RRP vs shelf price comparison',
        'Price correctness tracking',
        'Promotion flag visibility',
        'Outlet and sales rep filters',
        'Date range selection',
        'CSV export support'
      ]
    },
    {
      id: 'sos-report',
      title: 'SOS Report',
      description: 'Analyze Share of Shelf (SOS) performance by outlet, brand, and rep to track execution against targets.',
      path: '/sos-report',
      icon: <Target className="w-4 h-4" />,
      headerColor: 'bg-indigo-600',
      features: [
        'Brand vs total facings per outlet',
        'SOS% calculation and comparison',
        'Outlet target tracking',
        'Outlet and rep filters',
        'Date range selection',
        'CSV export support'
      ]
    },
    {
      id: 'competitor-activity-report',
      title: 'Competitor Activity Report',
      description: 'View competitor activity and market intelligence from visit reports. Track competing products and mechanisms.',
      path: '/competitor-activity-report',
      icon: <TrendingUp className="w-4 h-4" />,
      headerColor: 'bg-indigo-500',
      features: [
        'Competitor product tracking',
        'Market mechanism analysis',
        'Zuri product comparison',
        'Outlet and merchandiser filters',
        'Date range selection',
        'CSV export support'
      ]
    },
    {
      id: 'outlet-visits',
      title: 'Outlet Visits',
      description: 'View how many visits have been made to each outlet over the selected period.',
      path: '/dashboard/reports/outlet-visits',
      icon: <MapPin className="w-4 h-4" />,
      headerColor: 'bg-lime-600',
      features: [
        'Total visits per outlet',
        'Year and date range filters',
        'Outlet account filter',
        'Lightweight tabular view'
      ]
    },
    {
      id: 'outlet-visits-summary',
      title: 'Outlet Visits Summary',
      description: 'View monthly visit summaries by outlet with aggregated visit counts across months.',
      path: '/dashboard/reports/outlet-visits-summary',
      icon: <BarChart3 className="w-4 h-4" />,
      headerColor: 'bg-teal-600',
      features: [
        'Monthly visit breakdown',
        'Year and date range filters',
        'Outlet account filter',
        'Full-width detailed view'
      ]
    }
  ];

  const handleVisitClick = (path: string) => {
    navigate(path);
  };

  const handleViewClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Outlets Visits Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive visit reporting and analysis tools.</p>
            </div>
            <button
              onClick={() => navigate('/sales-dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Visits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Header Bar */}
              <div className={`${visit.headerColor} px-3 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="text-white">
                    {visit.icon}
                  </div>
                  <h3 className="text-white font-semibold text-sm">
                    {visit.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => handleViewClick(e, visit.path)}
                  className="px-2 py-0.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded transition-colors"
                >
                  View
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">
                  {visit.description}
                </p>

                {/* Key Features */}
                <div className="mb-3">
                  <ul className="space-y-1">
                    {visit.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-start">
                        <span className="text-gray-400 mr-1.5">•</span>
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* View Full Report Link */}
                <div
                  onClick={(e) => handleViewClick(e, visit.path)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium cursor-pointer mt-3"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>View Full Report</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitsIndexPage;
