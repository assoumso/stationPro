
import React, { useState, useMemo } from 'react';
import { StationData } from '../types';
import { Calendar, Download, Printer, Filter, Fuel, ShoppingCart, CreditCard, ChevronRight } from 'lucide-react';

interface ReportsProps {
  data: StationData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedReport, setSelectedReport] = useState<'all' | 'fuel' | 'shop' | 'expenses'>('all');

  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const shifts = data.shifts.filter(s => {
      const d = new Date(s.timestamp);
      return d >= start && d <= end;
    });

    const sales = data.sales.filter(s => {
      const d = new Date(s.timestamp);
      return d >= start && d <= end;
    });

    const expenses = data.expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    return { shifts, sales, expenses };
  }, [data, startDate, endDate]);

  const fuelStats = useMemo(() => {
    const stats: Record<string, { volume: number; amount: number }> = {};
    filteredData.shifts.forEach(s => {
      const pump = data.pumps.find(p => p.id === s.pumpId);
      const fuelType = pump?.fuelType || 'Inconnu';
      if (!stats[fuelType]) stats[fuelType] = { volume: 0, amount: 0 };
      stats[fuelType].volume += s.volumeSold;
      stats[fuelType].amount += s.totalAmount;
    });
    return stats;
  }, [filteredData, data]);

  const shopStats = useMemo(() => {
    const stats: Record<string, { qty: number; revenue: number }> = {};
    filteredData.sales.forEach(s => {
      const product = data.products.find(p => p.id === s.productId);
      const name = product?.name || 'Inconnu';
      if (!stats[name]) stats[name] = { qty: 0, revenue: 0 };
      stats[name].qty += s.quantity;
      stats[name].revenue += s.totalPrice;
    });
    return stats;
  }, [filteredData, data]);

  const expenseStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredData.expenses.forEach(e => {
      stats[e.category] = (stats[e.category] || 0) + e.amount;
    });
    return stats;
  }, [filteredData]);

  // Totals calculation
  const totals = {
    fuelRevenue: (Object.values(fuelStats) as { amount: number }[]).reduce((acc, v) => acc + v.amount, 0),
    fuelVolume: (Object.values(fuelStats) as { volume: number }[]).reduce((acc, v) => acc + v.volume, 0),
    shopRevenue: (Object.values(shopStats) as { revenue: number }[]).reduce((acc, v) => acc + v.revenue, 0),
    totalExpenses: (Object.values(expenseStats) as number[]).reduce((acc, v) => acc + v, 0),
  };

  const netResult = totals.fuelRevenue + totals.shopRevenue - totals.totalExpenses;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 pb-20">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-end gap-4 print:hidden">
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
              <Calendar size={12} /> Date Début
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
              <Calendar size={12} /> Date Fin
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            <Printer size={18} /> Imprimer
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
        {(['all', 'fuel', 'shop', 'expenses'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedReport(tab)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
              selectedReport === tab 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {tab === 'all' ? 'Résumé Global' : tab === 'fuel' ? 'Carburant' : tab === 'shop' ? 'Boutique' : 'Dépenses'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {selectedReport === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <ReportCard title="Revenu Carburant" value={totals.fuelRevenue} color="text-emerald-600" icon={<Fuel />} />
          <ReportCard title="Revenu Boutique" value={totals.shopRevenue} color="text-blue-600" icon={<ShoppingCart />} />
          <ReportCard title="Total Dépenses" value={totals.totalExpenses} color="text-red-600" icon={<CreditCard />} />
          <div className="md:col-span-3 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-indigo-100 font-bold uppercase text-xs tracking-widest mb-1">Bénéfice Net Période</p>
              <h4 className="text-4xl font-black">{Math.round(netResult).toLocaleString()} {data.settings?.currency || 'FCFA'}</h4>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Période du {new Date(startDate).toLocaleDateString()} au {new Date(endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Sections */}
      <div className="space-y-8">
        {(selectedReport === 'all' || selectedReport === 'fuel') && (
          <ReportSection title="Rapport Carburant & Index" icon={<Fuel className="text-emerald-500" />}>
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Type de Carburant</th>
                  <th className="px-6 py-4">Volume Vendu</th>
                  <th className="px-6 py-4 text-right">Chiffre d'Affaires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(Object.entries(fuelStats) as [string, { volume: number; amount: number }][]).map(([type, stats]) => (
                  <tr key={type} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{type}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{stats.volume.toLocaleString()} L</td>
                    <td className="px-6 py-4 text-right font-black">{Math.round(stats.amount).toLocaleString()} {data.settings?.currency || 'FCFA'}</td>
                  </tr>
                ))}
                {Object.keys(fuelStats).length > 0 ? (
                  <tr className="bg-emerald-600 text-white border-t-2 border-emerald-400">
                    <td className="px-6 py-4 font-black uppercase text-xs tracking-widest text-emerald-100">Total Général</td>
                    <td className="px-6 py-4 font-black text-white">{totals.fuelVolume.toLocaleString()} L</td>
                    <td className="px-6 py-4 text-right font-black text-white">
                      {Math.round(totals.fuelRevenue).toLocaleString()} {data.settings?.currency || 'FCFA'}
                    </td>
                  </tr>
                ) : (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Aucune vente enregistrée sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </ReportSection>
        )}

        {(selectedReport === 'all' || selectedReport === 'shop') && (
          <ReportSection title="Rapport Ventes Boutique" icon={<ShoppingCart className="text-blue-500" />}>
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Désignation Produit</th>
                  <th className="px-6 py-4">Quantité Vendue</th>
                  <th className="px-6 py-4 text-right">Revenu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(Object.entries(shopStats) as [string, { qty: number; revenue: number }][]).map(([name, stats]) => (
                  <tr key={name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{name}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{stats.qty} unités</td>
                    <td className="px-6 py-4 text-right font-black">{Math.round(stats.revenue).toLocaleString()} {data.settings?.currency || 'FCFA'}</td>
                  </tr>
                ))}
                {Object.keys(shopStats).length > 0 ? (
                  <tr className="bg-blue-600 text-white border-t-2 border-blue-400">
                    <td className="px-6 py-4 font-black uppercase text-xs tracking-widest text-blue-100">Total Boutique</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right font-black text-white">
                      {Math.round(totals.shopRevenue).toLocaleString()} {data.settings?.currency || 'FCFA'}
                    </td>
                  </tr>
                ) : (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Aucune vente enregistrée sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </ReportSection>
        )}

        {(selectedReport === 'all' || selectedReport === 'expenses') && (
          <ReportSection title="Rapport Dépenses par Catégorie" icon={<CreditCard className="text-red-500" />}>
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4 text-right">Montant Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(Object.entries(expenseStats) as [string, number][]).map(([cat, amount]) => (
                  <tr key={cat} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{cat}</td>
                    <td className="px-6 py-4 text-right font-black text-red-600">{Math.round(amount).toLocaleString()} {data.settings?.currency || 'FCFA'}</td>
                  </tr>
                ))}
                {Object.keys(expenseStats).length > 0 ? (
                  <tr className="bg-red-600 text-white border-t-2 border-red-400">
                    <td className="px-6 py-4 font-black uppercase text-xs tracking-widest text-red-100">Total Dépenses</td>
                    <td className="px-6 py-4 text-right font-black text-white">
                      {Math.round(totals.totalExpenses).toLocaleString()} {data.settings?.currency || 'FCFA'}
                    </td>
                  </tr>
                ) : (
                  <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Aucune dépense enregistrée sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </ReportSection>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ title, value, color, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className={`text-2xl font-black ${color}`}>{Math.round(value).toLocaleString()} <span className="text-sm">FCFA</span></h4>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-50 ${color.replace('text-', 'text-opacity-20 ')}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
  </div>
);

const ReportSection = ({ title, icon, children }: any) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
      {icon}
      <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export default Reports;
