
import React from 'react';
import { StationData } from '../types';
import { TrendingUp, Fuel, ShoppingBag, CreditCard, AlertTriangle, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  data: StationData;
  onGetInsights: () => void;
  insights: string | null;
  isGenerating: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onGetInsights, insights, isGenerating }) => {
  const fuelSales = data.shifts.reduce((acc, s) => acc + s.totalAmount, 0);
  const shopSales = data.sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = (fuelSales + shopSales) - totalExpenses;

  const fuelStats = data.tanks.map(t => ({
    name: t.fuelType,
    level: t.currentLevel,
    capacity: t.capacity,
    percentage: Math.round((t.currentLevel / t.capacity) * 100)
  }));

  const chartData = [
    { name: 'Carburant', value: fuelSales },
    { name: 'Boutique', value: shopSales },
    { name: 'Dépenses', value: totalExpenses },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ventes Carburant" 
          value={`${Math.round(fuelSales).toLocaleString()} FCFA`} 
          icon={<Fuel className="text-emerald-600" />} 
          subtext="Total du mois" 
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
          textColor="text-emerald-900"
        />
        <StatCard 
          title="Ventes Boutique" 
          value={`${Math.round(shopSales).toLocaleString()} FCFA`} 
          icon={<ShoppingBag className="text-blue-600" />} 
          subtext="Produits divers" 
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
          textColor="text-blue-900"
        />
        <StatCard 
          title="Dépenses" 
          value={`${Math.round(totalExpenses).toLocaleString()} FCFA`} 
          icon={<CreditCard className="text-red-600" />} 
          subtext="Opérationnel" 
          bgColor="bg-red-50"
          borderColor="border-red-100"
          textColor="text-red-900"
        />
        <StatCard 
          title="Bénéfice Net" 
          value={`${Math.round(netProfit).toLocaleString()} FCFA`} 
          icon={<TrendingUp className="text-indigo-600" />} 
          subtext="Revenu net global" 
          bgColor="bg-indigo-50"
          borderColor="border-indigo-100"
          textColor="text-indigo-900"
          highlight={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-slate-400" /> Performance Financière
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${Math.round(value).toLocaleString()} FCFA`, '']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" /> État des Cuves
          </h3>
          <div className="space-y-6">
            {fuelStats.map(stat => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{stat.name}</span>
                  <span>{stat.level.toLocaleString()}L / {stat.capacity.toLocaleString()}L</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${stat.percentage < 20 ? 'bg-red-500' : stat.percentage < 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-right">{stat.percentage}% restants</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Consultant IA Gemini</h3>
              <p className="text-indigo-100 text-sm">Analyse intelligente de votre activité</p>
            </div>
          </div>
          <button 
            onClick={onGetInsights}
            disabled={isGenerating}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Analyse...' : 'Générer Conseils'}
          </button>
        </div>
        
        {insights ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 whitespace-pre-wrap leading-relaxed">
            {insights}
          </div>
        ) : (
          <p className="italic text-indigo-100 opacity-70">
            Cliquez pour recevoir une analyse détaillée des performances de votre station.
          </p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtext, highlight, bgColor = 'bg-white', borderColor = 'border-slate-200', textColor = 'text-slate-900' }: any) => (
  <div className={`${bgColor} p-5 rounded-2xl border ${borderColor} flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 cursor-default shadow-sm`}>
    <div className="flex items-center justify-between mb-4">
      <span className={`text-sm font-semibold uppercase tracking-wider opacity-60 ${textColor}`}>{title}</span>
      <div className="p-2.5 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
        {icon}
      </div>
    </div>
    <div>
      <h4 className={`text-2xl font-black ${highlight || textColor}`}>{value}</h4>
      <p className={`text-xs mt-1 opacity-50 font-medium ${textColor}`}>{subtext}</p>
    </div>
  </div>
);

export default Dashboard;
