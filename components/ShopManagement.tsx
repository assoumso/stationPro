
import React, { useState } from 'react';
import { StationData, Product, Sale, RestockRecord } from '../types';
import { ShoppingCart, Package, AlertCircle, Plus, Minus, Edit2, Trash2, Truck, Check, X, Search, History } from 'lucide-react';
import AutocompleteSelect from './AutocompleteSelect';

interface ShopManagementProps {
  data: StationData;
  onAddSale: (sale: Sale) => void;
  onUpdateStock: (productId: string, quantity: number) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddRestock: (restock: RestockRecord) => void;
}

const ShopManagement: React.FC<ShopManagementProps> = ({ 
  data, onAddSale, onUpdateStock, onAddProduct, onUpdateProduct, onDeleteProduct, onAddRestock 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'catalog'>('sales');
  const [selectedProductId, setSelectedProductId] = useState<string>(data.products[0]?.id || '');
  const [qty, setQty] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestockHistory, setShowRestockHistory] = useState(false);

  // États pour la création/édition de produit
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempProduct, setTempProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Boutique',
    purchasePrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5
  });

  // État pour l'approvisionnement rapide
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<number>(0);

  const selectedProduct = data.products.find(p => p.id === selectedProductId);

  const filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSale = () => {
    if (!selectedProduct) return;
    if (selectedProduct.stock < qty) {
      alert("Stock insuffisant !");
      return;
    }

    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      productId: selectedProduct.id,
      quantity: qty,
      totalPrice: selectedProduct.salePrice * qty
    };

    onAddSale(sale);
    onUpdateStock(selectedProduct.id, -qty);
    setQty(1);
    alert("Vente enregistrée !");
  };

  const handleSaveProduct = () => {
    if (!tempProduct.name || (tempProduct.salePrice || 0) <= 0) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (editingProductId) {
      onUpdateProduct(tempProduct as Product);
      setEditingProductId(null);
    } else {
      const newProduct: Product = {
        ...tempProduct as Product,
        id: Math.random().toString(36).substr(2, 9),
      };
      onAddProduct(newProduct);
      setIsAddingProduct(false);
    }
    setTempProduct({
      name: '',
      category: 'Boutique',
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      minStock: 5
    });
  };

  const handleRestock = (id: string) => {
    if (restockQty <= 0) return;
    const product = data.products.find(p => p.id === id);
    if (!product) return;

    const restockRecord: RestockRecord = {
      id: Math.random().toString(36).substr(2, 9),
      productId: id,
      quantity: restockQty,
      purchasePrice: product.purchasePrice,
      timestamp: new Date().toISOString()
    };

    onAddRestock(restockRecord);
    setRestockProductId(null);
    setRestockQty(0);
    alert("Approvisionnement enregistré dans l'historique !");
  };

  const productOptions = data.products.map(p => ({
    id: p.id,
    label: p.name,
    sublabel: `${p.stock} en stock`
  }));

  const categoryOptions = [
    { id: 'Lubrifiants', label: 'Lubrifiants' },
    { id: 'Entretien', label: 'Entretien' },
    { id: 'Boutique', label: 'Boutique (Alimentaire/Divers)' },
    { id: 'Accessoires', label: 'Accessoires Auto' }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveSubTab('sales')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeSubTab === 'sales' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Caisse & Ventes
        </button>
        <button 
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeSubTab === 'catalog' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Gestion du Catalogue
        </button>
      </div>

      {activeSubTab === 'sales' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-24">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-500" /> Vente Boutique
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 text-xs uppercase tracking-wider">Sélectionner Produit</label>
                <AutocompleteSelect 
                  options={productOptions}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  placeholder="Rechercher un produit..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-xs uppercase tracking-wider">Quantité</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full text-center border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                    />
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500 font-bold uppercase">Prix Unitaire</span>
                  <span className="font-semibold">{selectedProduct ? Math.round(selectedProduct.salePrice).toLocaleString() : '0'} FCFA</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-sm text-slate-700 font-bold uppercase">Total À Payer</span>
                  <span className="text-2xl font-black text-blue-600">
                    {selectedProduct ? Math.round(selectedProduct.salePrice * qty).toLocaleString() : '0'} FCFA
                  </span>
                </div>
              </div>

              <button 
                onClick={handleSale}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-4"
              >
                Valider & Encaisser
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Package size={18} className="text-slate-400" /> Stock en Temps Réel
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-slate-400 font-bold bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Produit</th>
                    <th className="px-6 py-3">Catégorie</th>
                    <th className="px-6 py-3">Prix</th>
                    <th className="px-6 py-3">En Stock</th>
                    <th className="px-6 py-3">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minStock;
                    const isCritical = p.stock === 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-blue-600">{Math.round(p.salePrice).toLocaleString()} FCFA</td>
                        <td className={`px-6 py-4 font-bold ${isCritical ? 'text-red-600' : isLow ? 'text-amber-500' : 'text-emerald-600'}`}>{p.stock}</td>
                        <td className="px-6 py-4">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800">
                              Rupture
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                              Stock Bas
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-800">Catalogue & Approvisionnement</h3>
              <button 
                onClick={() => setShowRestockHistory(!showRestockHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showRestockHistory ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <History size={14} /> {showRestockHistory ? 'Voir Catalogue' : 'Voir Historique Appro'}
              </button>
            </div>
            {!showRestockHistory && (
              <button 
                onClick={() => {
                  setEditingProductId(null);
                  setTempProduct({ name: '', category: 'Boutique', purchasePrice: 0, salePrice: 0, stock: 0, minStock: 5 });
                  setIsAddingProduct(!isAddingProduct);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all"
              >
                {isAddingProduct ? <X size={18} /> : <Plus size={18} />}
                {isAddingProduct ? 'Annuler' : 'Nouveau Produit'}
              </button>
            )}
          </div>

          {!showRestockHistory ? (
            <>
              {(isAddingProduct || editingProductId) && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-900">
                    {editingProductId ? <Edit2 size={20} /> : <Plus size={20} />}
                    {editingProductId ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nom du produit</label>
                      <input 
                        type="text" 
                        value={tempProduct.name}
                        onChange={(e) => setTempProduct({...tempProduct, name: e.target.value})}
                        placeholder="Désignation"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Catégorie</label>
                      <AutocompleteSelect 
                        options={categoryOptions}
                        value={tempProduct.category || 'Boutique'}
                        onChange={(val) => setTempProduct({...tempProduct, category: val})}
                        placeholder="Choisir une catégorie..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prix d'Achat (FCFA)</label>
                      <input 
                        type="number" 
                        value={tempProduct.purchasePrice || ''}
                        onChange={(e) => setTempProduct({...tempProduct, purchasePrice: Number(e.target.value)})}
                        placeholder="0"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prix de Vente (FCFA)</label>
                      <input 
                        type="number" 
                        value={tempProduct.salePrice || ''}
                        onChange={(e) => setTempProduct({...tempProduct, salePrice: Number(e.target.value)})}
                        placeholder="0"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Stock Initial</label>
                      <input 
                        type="number" 
                        value={tempProduct.stock || ''}
                        onChange={(e) => setTempProduct({...tempProduct, stock: Number(e.target.value)})}
                        placeholder="0"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!!editingProductId}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Seuil Alerte Stock</label>
                      <input 
                        type="number" 
                        value={tempProduct.minStock || ''}
                        onChange={(e) => setTempProduct({...tempProduct, minStock: Number(e.target.value)})}
                        placeholder="5"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button 
                      onClick={() => { setIsAddingProduct(false); setEditingProductId(null); }}
                      className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleSaveProduct}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Check size={18} /> Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase text-slate-400 font-black bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4">Produit</th>
                        <th className="px-6 py-4">Stock Actuel</th>
                        <th className="px-6 py-4">Marge (FCFA)</th>
                        <th className="px-6 py-4">Actions & Approvisionnement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.products.map((p) => {
                        const margin = p.salePrice - p.purchasePrice;
                        const isRestocking = restockProductId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black">{p.category}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-black text-lg ${p.stock <= p.minStock ? 'text-red-500' : 'text-slate-700'}`}>{p.stock}</span>
                              <span className="text-xs text-slate-400 ml-1">unités</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-emerald-600">+{margin.toLocaleString()} FCFA</p>
                              <p className="text-[10px] text-slate-400">Vente: {p.salePrice.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {isRestocking ? (
                                  <div className="flex items-center gap-2 bg-blue-50 p-1.5 rounded-xl border border-blue-200 animate-in zoom-in-95">
                                    <input 
                                      type="number" 
                                      placeholder="+ Qty"
                                      value={restockQty || ''}
                                      onChange={(e) => setRestockQty(Number(e.target.value))}
                                      className="w-20 px-2 py-1 text-sm border border-blue-300 rounded outline-none"
                                      autoFocus
                                    />
                                    <button onClick={() => handleRestock(p.id)} className="p-1 bg-blue-600 text-white rounded"><Check size={16} /></button>
                                    <button onClick={() => setRestockProductId(null)} className="p-1 bg-slate-400 text-white rounded"><X size={16} /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => setRestockProductId(p.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                    >
                                      <Truck size={14} /> Approvisionner
                                    </button>
                                    <button 
                                      onClick={() => { setEditingProductId(p.id); setTempProduct(p); setIsAddingProduct(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => { if(confirm('Supprimer ce produit du catalogue ?')) onDeleteProduct(p.id); }}
                                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <History size={16} className="text-indigo-500" /> Historique Récent des Approvisionnements
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase text-slate-400 font-black bg-slate-50/20">
                    <tr>
                      <th className="px-6 py-4">Date & Heure</th>
                      <th className="px-6 py-4">Produit</th>
                      <th className="px-6 py-4">Quantité Ajoutée</th>
                      <th className="px-6 py-4">Valeur Appro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.restocks && data.restocks.length > 0 ? (
                      data.restocks.map((r) => {
                        const product = data.products.find(p => p.id === r.productId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                              {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{product?.name || 'Produit Inconnu'}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{product?.category}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-black">
                                +{r.quantity.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {(r.quantity * r.purchasePrice).toLocaleString()} FCFA
                              <p className="text-[10px] text-slate-400">Unité: {r.purchasePrice.toLocaleString()}</p>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center italic text-slate-400">
                          Aucun historique d'approvisionnement disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
