
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Fuel, ShoppingBag, CreditCard, Settings as SettingsIcon, Menu, X, LogOut, Loader2, FileText } from 'lucide-react';
import { StationData, ShiftRecord, Sale, Expense, Tank, Pump, FuelType, Product, RestockRecord, GeneralSettings } from './types';
import Dashboard from './components/Dashboard';
import FuelManagement from './components/FuelManagement';
import ShopManagement from './components/ShopManagement';
import ExpenseManagement from './components/ExpenseManagement';
import Settings from './components/Settings';
import Reports from './components/Reports';
import { getAIInsights } from './services/geminiService';
import { subscribeToStationData, updateStationData } from './services/firebase';

const App: React.FC = () => {
  const [data, setData] = useState<StationData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fuel' | 'shop' | 'expenses' | 'reports' | 'settings'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Synchronisation temps-réel avec Firebase
  useEffect(() => {
    const unsubscribe = subscribeToStationData((remoteData) => {
      setData(remoteData);
    });
    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Connexion à la base StationPro...</p>
        </div>
      </div>
    );
  }

  const handleUpdateGeneralSettings = (settings: GeneralSettings) => {
    const nextData: StationData = { ...data, settings };
    updateStationData(nextData);
  };

  const handleCompleteShift = (shift: ShiftRecord, tankId: string, pumpId: string, newIndex: number) => {
    const nextData: StationData = {
      ...data,
      shifts: [...data.shifts, shift],
      tanks: data.tanks.map(t => t.id === tankId ? { ...t, currentLevel: t.currentLevel - shift.volumeSold } : t),
      pumps: data.pumps.map(p => p.id === pumpId ? { ...p, lastIndex: newIndex } : p)
    };
    updateStationData(nextData);
  };

  const handleAddSale = (sale: Sale) => {
    const nextData: StationData = { ...data, sales: [...data.sales, sale] };
    updateStationData(nextData);
  };

  const handleUpdateStock = (productId: string, qtyDelta: number) => {
    const nextData: StationData = {
      ...data,
      products: data.products.map(p => p.id === productId ? { ...p, stock: p.stock + qtyDelta } : p)
    };
    updateStationData(nextData);
  };

  const handleAddRestock = (restock: RestockRecord) => {
    const nextData: StationData = {
      ...data,
      restocks: [restock, ...(data.restocks || [])],
      products: data.products.map(p => p.id === restock.productId ? { ...p, stock: p.stock + restock.quantity } : p)
    };
    updateStationData(nextData);
  };

  const handleAddProduct = (product: Product) => {
    const nextData: StationData = { ...data, products: [...data.products, product] };
    updateStationData(nextData);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const nextData: StationData = {
      ...data,
      products: data.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    };
    updateStationData(nextData);
  };

  const handleDeleteProduct = (id: string) => {
    const nextData: StationData = {
      ...data,
      products: data.products.filter(p => p.id !== id)
    };
    updateStationData(nextData);
  };

  const handleAddExpense = (expense: Expense) => {
    const nextData: StationData = { ...data, expenses: [...data.expenses, expense] };
    updateStationData(nextData);
  };

  const handleDeleteExpense = (id: string) => {
    const nextData: StationData = { ...data, expenses: data.expenses.filter(e => e.id !== id) };
    updateStationData(nextData);
  };

  const handleUpdateFuelPrice = (fuelType: FuelType, price: number) => {
    const nextData: StationData = {
      ...data,
      fuelPrices: { ...data.fuelPrices, [fuelType]: price }
    };
    updateStationData(nextData);
  };

  const handleAddFuelType = (fuelType: FuelType, initialPrice: number) => {
    const nextData: StationData = {
      ...data,
      fuelPrices: { ...data.fuelPrices, [fuelType]: initialPrice }
    };
    updateStationData(nextData);
  };

  const handleDeleteFuelType = (fuelType: FuelType) => {
    const newPrices = { ...data.fuelPrices };
    delete newPrices[fuelType];
    const nextData: StationData = {
      ...data,
      fuelPrices: newPrices
    };
    updateStationData(nextData);
  };

  const handleRenameFuelType = (oldType: FuelType, newType: FuelType) => {
    const newPrices = { ...data.fuelPrices };
    const currentPrice = newPrices[oldType];
    delete newPrices[oldType];
    newPrices[newType] = currentPrice;

    const nextData: StationData = {
      ...data,
      fuelPrices: newPrices,
      tanks: data.tanks.map(t => t.fuelType === oldType ? { ...t, fuelType: newType } : t),
      pumps: data.pumps.map(p => p.fuelType === oldType ? { ...p, fuelType: newType } : p)
    };
    updateStationData(nextData);
  };

  const handleUpdateTank = (updatedTank: Tank) => {
    const nextData: StationData = {
      ...data,
      tanks: data.tanks.map(t => t.id === updatedTank.id ? updatedTank : t)
    };
    updateStationData(nextData);
  };

  const handleAddPump = (pump: Pump) => {
    const nextData: StationData = { ...data, pumps: [...data.pumps, pump] };
    updateStationData(nextData);
  };

  const handleUpdatePump = (updatedPump: Pump) => {
    const nextData: StationData = {
      ...data,
      pumps: data.pumps.map(p => p.id === updatedPump.id ? updatedPump : p)
    };
    updateStationData(nextData);
  };

  const handleGetInsights = async () => {
    setIsGeneratingInsights(true);
    const insights = await getAIInsights(data);
    setAiInsights(insights);
    setIsGeneratingInsights(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { id: 'fuel', label: 'Carburant & Index', icon: <Fuel size={20} /> },
    { id: 'shop', label: 'Boutique & Ventes', icon: <ShoppingBag size={20} /> },
    { id: 'expenses', label: 'Dépenses', icon: <CreditCard size={20} /> },
    { id: 'reports', label: 'Rapports', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Paramètres', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <button 
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Fuel className="text-white" size={24} />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg text-white leading-tight truncate">
                {data.settings?.stationName || "StationPro"}
              </h1>
              <span className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase block truncate">
                {data.settings?.managerName || "Gérant"}
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 mt-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                `}
              >
                {item.icon}
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors w-full group">
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-semibold text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-700">{data.settings?.stationName || "Station Pro"}</span>
              <span className="text-xs text-slate-400 font-medium">Gérant: {data.settings?.managerName || "Admin"} • {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data.settings?.managerName || 'Admin')}&background=6366f1&color=fff&rounded=true`} 
              alt="Profile" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm"
            />
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={data} 
              onGetInsights={handleGetInsights} 
              insights={aiInsights} 
              isGenerating={isGeneratingInsights}
            />
          )}
          {activeTab === 'fuel' && (
            <FuelManagement 
              data={data} 
              onCompleteShift={handleCompleteShift}
            />
          )}
          {activeTab === 'shop' && (
            <ShopManagement 
              data={data} 
              onAddSale={handleAddSale} 
              onUpdateStock={handleUpdateStock}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddRestock={handleAddRestock}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpenseManagement 
              data={data} 
              onAddExpense={handleAddExpense} 
              onDeleteExpense={handleDeleteExpense}
            />
          )}
          {activeTab === 'reports' && (
            <Reports data={data} />
          )}
          {activeTab === 'settings' && (
            <Settings 
              data={data}
              onUpdatePrice={handleUpdateFuelPrice}
              onAddFuelType={handleAddFuelType}
              onDeleteFuelType={handleDeleteFuelType}
              onRenameFuelType={handleRenameFuelType}
              onUpdateTank={handleUpdateTank}
              onAddPump={handleAddPump}
              onUpdatePump={handleUpdatePump}
              onUpdateGeneralSettings={handleUpdateGeneralSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
