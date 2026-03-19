
import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { Download, FileText, Calendar, Filter } from 'lucide-react';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const history = await mockApi.getPointsHistory();
      // Simple aggregation for time series (Monthly Points Issued)
      const monthly: any = {};
      history.forEach(tx => {
        const date = new Date(tx.createdAt);
        const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (tx.points > 0) {
          monthly[key] = (monthly[key] || 0) + tx.points;
        }
      });
      setReportData(Object.keys(monthly).map(month => ({ month, points: monthly[month] })));
    };
    fetchData();
  }, []);

  const exportCSV = () => {
    alert('Generating CSV Report... (Mock Action)');
    // In a real app, logic to convert JSON to CSV and download would go here.
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500">Analyze performance trends and download data logs.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8 flex items-center">
            <Calendar className="mr-2 text-blue-600" /> Points Issued Over Time
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#1E40AF" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#1E40AF', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Filter className="mr-2 text-orange-500" size={18} /> Available Reports
            </h4>
            <div className="space-y-2">
              <ReportLink icon={<FileText size={16} />} label="Monthly Summary" />
              <ReportLink icon={<FileText size={16} />} label="Top Performers (Lifetime)" />
              <ReportLink icon={<FileText size={16} />} label="Redemption Audit Log" />
              <ReportLink icon={<FileText size={16} />} label="Contest Participation Stats" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
            <h4 className="font-bold mb-2">Performance Tip</h4>
            <p className="text-sm text-orange-100">Safety Excellence accounts for 42% of all points issued. Consider adjusting weights to promote customer service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportLink = ({ icon, label }: any) => (
  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
    <div className="flex items-center space-x-3">
      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <div className="text-gray-300 group-hover:text-blue-400">→</div>
  </button>
);

export default Reports;
