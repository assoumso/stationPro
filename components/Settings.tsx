
import React, { useState } from 'react';
import { StationData, FuelType, Tank, Pump, GeneralSettings } from '../types';
import { Settings as SettingsIcon, Droplets, Zap, DollarSign, Plus, Edit2, Check, X, Trash2, Fuel as FuelIcon, AlertCircle, Info, User, Phone, Mail, MapPin, Clock } from 'lucide-react';
import AutocompleteSelect from './AutocompleteSelect';

interface SettingsProps {
  data: StationData;
  onUpdatePrice: (type: FuelType, price: number) => void;
  onAddFuelType: (type: FuelType, price: number) => void;
  onDeleteFuelType: (type: FuelType) => void;
  onRenameFuelType: (oldType: FuelType, newType: FuelType) => void;
  onUpdateTank: (tank: Tank) => void;
  onAddPump: (pump: Pump) => void;
  onUpdatePump: (pump: Pump) => void;
  onUpdateGeneralSettings: (settings: GeneralSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  data, onUpdatePrice, onAddFuelType, onDeleteFuelType, onRenameFuelType, 
  onUpdateTank, onAddPump, onUpdatePump, onUpdateGeneralSettings 
}) => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'general'>('fuel');
  
  // États pour gestion dynamique des carburants
  const [newFuelName, setNewFuelName] = useState('');
  const [newFuelPrice, setNewFuelPrice] = useState<number>(0);
  const [editingFuelType, setEditingFuelType] = useState<string | null>(null);
  const [tempFuelName, setTempFuelName] = useState('');

  // États pour l'édition Cuves/Pompes
  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const [editingPumpId, setEditingPumpId] = useState<string | null>(null);
  const [tempTank, setTempTank] = useState<Tank | null>(null);
  const [tempPump, setTempPump] = useState<Pump | null>(null);

  // État pour les paramètres généraux
  const [genSettings, setGenSettings] = useState<GeneralSettings>(data.settings || {
    stationName: '',
    managerName: '',
    phone: '',
    email: '',
    address: '',
    currency: 'FCFA',
    openingHours: ''
  });

  const [newPumpName, setNewPumpName] = useState('');
  const [newPumpTankId, setNewPumpTankId] = useState(data.tanks[0]?.id || '');

  // Handlers
  const handleAddFuel = () => {
    if (!newFuelName || newFuelPrice <= 0) return;
    if (data.fuelPrices[newFuelName]) {
      alert("Ce type de carburant existe déjà.");
      return;
    }
    onAddFuelType(newFuelName, newFuelPrice);
    setNewFuelName('');
    setNewFuelPrice(0);
  };

  const handleStartRenameFuel = (type: string) => {
    setEditingFuelType(type);
    setTempFuelName(type);
  };

  const handleSaveRenameFuel = () => {
    if (tempFuelName && tempFuelName !== editingFuelType) {
      onRenameFuelType(editingFuelType!, tempFuelName);
    }
    setEditingFuelType(null);
  };

  const handleDeleteFuel = (type: string) => {
    const isUsedInTank = data.tanks.some(t => t.fuelType === type);
    const isUsedInPump = data.pumps.some(p => p.fuelType === type);

    if (isUsedInTank || isUsedInPump) {
      alert(`Impossible de supprimer "${type}" : il est actuellement utilisé par une cuve ou une pompe.`);
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le carburant "${type}" ?`)) {
      onDeleteFuelType(type);
    }
  };

  const startEditTank = (tank: Tank) => {
    setEditingTankId(tank.id);
    setTempTank({ ...tank });
  };

  const saveTank = () => {
    if (tempTank) {
      onUpdateTank(tempTank);
      setEditingTankId(null);
      setTempTank(null);
    }
  };

  const startEditPump = (pump: Pump) => {
    setEditingPumpId(pump.id);
    setTempPump({ ...pump });
  };

  const savePump = () => {
    if (tempPump) {
      const associatedTank = data.tanks.find(t => t.id === tempPump.tankId);
      const updatedPump = {
        ...tempPump,
        fuelType: associatedTank?.fuelType || tempPump.fuelType
      };
      onUpdatePump(updatedPump);
      setEditingPumpId(null);
      setTempPump(null);
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGeneralSettings(genSettings);
    alert("Paramètres généraux enregistrés !");
  };

  const fuelTypes = Object.keys(data.fuelPrices);
  const fuelTypeOptions = fuelTypes.map(ft => ({ id: ft, label: ft }));
  const tankOptions = data.tanks.map(t => ({ id: t.id, label: `Cuve ${t.fuelType}`, sublabel: `ID: ${t.id}` }));

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('fuel')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeTab === 'fuel' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Carburants & Pompes
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Paramètres Généraux
        </button>
      </div>

      {activeTab === 'fuel' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* SECTION : GESTION DES TYPES DE CARBURANT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FuelIcon size={20} className="text-indigo-500" /> Carburants & Tarifs
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fuelTypes.map((type) => (
                    <div key={type} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3 transition-all hover:border-indigo-200 hover:shadow-md">
                      <div className="flex justify-between items-center">
                        {editingFuelType === type ? (
                          <input 
                            value={tempFuelName}
                            onChange={(e) => setTempFuelName(e.target.value)}
                            className="font-bold text-slate-800 border-b border-indigo-500 bg-transparent outline-none w-2/3"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{type}</span>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingFuelType === type ? (
                            <button onClick={handleSaveRenameFuel} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                          ) : (
                            <button onClick={() => handleStartRenameFuel(type)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16} /></button>
                          )}
                          <button onClick={() => handleDeleteFuel(type)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Prix :</label>
                        <input 
                          type="number" 
                          value={data.fuelPrices[type]}
                          onChange={(e) => onUpdatePrice(type, Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold text-emerald-600 outline-none w-full"
                        />
                        <span className="text-[10px] font-bold text-slate-400">{data.settings?.currency || 'FCFA'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 h-fit">
                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Plus size={16} /> Nouveau Carburant
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Nom</label>
                    <input 
                      type="text"
                      placeholder="Ex: Super"
                      value={newFuelName}
                      onChange={(e) => setNewFuelName(e.target.value)}
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase mb-1">Prix ({data.settings?.currency || 'FCFA'})</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={newFuelPrice || ''}
                      onChange={(e) => setNewFuelPrice(Number(e.target.value))}
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button 
                    onClick={handleAddFuel}
                    className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION : CUVES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Droplets size={20} className="text-blue-500" /> Gestion des Cuves
              </h3>
              <div className="space-y-4">
                {data.tanks.map((tank) => {
                  const isEditing = editingTankId === tank.id;
                  const currentTank = isEditing ? tempTank! : tank;
                  return (
                    <div key={tank.id} className={`p-4 rounded-xl border transition-all ${isEditing ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-50' : 'bg-blue-50 border-blue-100'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex-1">
                          {isEditing ? (
                            <AutocompleteSelect 
                              options={fuelTypeOptions}
                              value={currentTank.fuelType}
                              onChange={(val) => setTempTank({...currentTank, fuelType: val})}
                              className="mb-2"
                            />
                          ) : (
                            <span className="font-bold text-blue-900">{tank.fuelType} (ID: {tank.id})</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <><button onClick={saveTank} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check size={16} /></button><button onClick={() => setEditingTankId(null)} className="p-1.5 bg-slate-400 text-white rounded-lg"><X size={16} /></button></>
                          ) : (
                            <button onClick={() => startEditTank(tank)} className="p-1.5 bg-white text-blue-500 rounded-lg border border-blue-200"><Edit2 size={16} /></button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Capacité (L)</label>
                          <input type="number" value={currentTank.capacity} onChange={(e) => isEditing ? setTempTank({...currentTank, capacity: Number(e.target.value)}) : onUpdateTank({ ...tank, capacity: Number(e.target.value) })} className={`w-full rounded-lg px-3 py-1.5 text-sm ${isEditing ? 'border border-blue-300' : 'bg-white/50'}`} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Seuil Critique (L)</label>
                          <input type="number" value={currentTank.criticalLevel} onChange={(e) => isEditing ? setTempTank({...currentTank, criticalLevel: Number(e.target.value)}) : onUpdateTank({ ...tank, criticalLevel: Number(e.target.value) })} className={`w-full rounded-lg px-3 py-1.5 text-sm ${isEditing ? 'border border-blue-300' : 'bg-white/50'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION : POMPES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" /> Gestion des Pompes
              </h3>
              <div className="space-y-4 mb-8">
                {data.pumps.map((pump) => {
                  const isEditing = editingPumpId === pump.id;
                  const currentPump = isEditing ? tempPump! : pump;
                  const tank = data.tanks.find(t => t.id === currentPump.tankId);
                  return (
                    <div key={pump.id} className={`p-4 rounded-xl border transition-all ${isEditing ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-50' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          {isEditing ? (
                            <>
                              <input type="text" value={currentPump.name} onChange={(e) => setTempPump({...currentPump, name: e.target.value})} className="font-bold border border-amber-300 rounded px-2 py-1 w-full mb-1" />
                              <AutocompleteSelect 
                                options={tankOptions}
                                value={currentPump.tankId}
                                onChange={(val) => setTempPump({...currentPump, tankId: val})}
                                placeholder="Choisir une cuve..."
                              />
                            </>
                          ) : (
                            <><p className="font-bold text-slate-800">{pump.name}</p><p className="text-xs text-slate-500">Liée à : Cuve {tank?.fuelType}</p></>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {isEditing ? (
                            <><button onClick={savePump} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check size={16} /></button><button onClick={() => setEditingPumpId(null)} className="p-1.5 bg-slate-400 text-white rounded-lg"><X size={16} /></button></>
                          ) : (
                            <button onClick={() => startEditPump(pump)} className="p-1.5 bg-white text-amber-500 rounded-lg border border-amber-200"><Edit2 size={16} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2"><Plus size={16} /> Ajouter une Pompe</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Nom de la pompe" value={newPumpName} onChange={(e) => setNewPumpName(e.target.value)} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                  <AutocompleteSelect 
                    options={tankOptions}
                    value={newPumpTankId}
                    onChange={setNewPumpTankId}
                    placeholder="Choisir une cuve..."
                  />
                  <button onClick={() => { if (!newPumpName) return; const selectedTank = data.tanks.find(t => t.id === newPumpTankId); onAddPump({ id: Math.random().toString(36).substr(2, 9), name: newPumpName, tankId: newPumpTankId, fuelType: selectedTank?.fuelType || 'Essence', lastIndex: 0 }); setNewPumpName(''); }} className="w-full bg-amber-600 text-white font-bold py-2 rounded-lg text-sm shadow hover:bg-amber-700 transition-colors">Enregistrer la pompe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-2 duration-300">
          <form onSubmit={handleSaveGeneralSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Info size={20} className="text-indigo-500" /> Informations Station
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <FuelIcon size={12} /> Nom de la Station
                  </label>
                  <input 
                    type="text" 
                    value={genSettings.stationName}
                    onChange={(e) => setGenSettings({...genSettings, stationName: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="Ex: Station Centre-Ville"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <User size={12} /> Nom du Gérant / Propriétaire
                  </label>
                  <input 
                    type="text" 
                    value={genSettings.managerName}
                    onChange={(e) => setGenSettings({...genSettings, managerName: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Clock size={12} /> Horaires d'Ouverture
                  </label>
                  <input 
                    type="text" 
                    value={genSettings.openingHours}
                    onChange={(e) => setGenSettings({...genSettings, openingHours: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="Ex: 24h/24, 7j/7"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <DollarSign size={12} /> Devise Monétaire
                  </label>
                  <input 
                    type="text" 
                    value={genSettings.currency}
                    onChange={(e) => setGenSettings({...genSettings, currency: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="Ex: FCFA, EUR, USD"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Phone size={20} className="text-emerald-500" /> Contacts & Localisation
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Phone size={12} /> Numéro de Téléphone
                  </label>
                  <input 
                    type="tel" 
                    value={genSettings.phone}
                    onChange={(e) => setGenSettings({...genSettings, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="+225 01 02 03 04 05"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Mail size={12} /> Adresse Email
                  </label>
                  <input 
                    type="email" 
                    value={genSettings.email}
                    onChange={(e) => setGenSettings({...genSettings, email: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    placeholder="contact@station.ci"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Adresse Physique
                  </label>
                  <textarea 
                    rows={4}
                    value={genSettings.address}
                    onChange={(e) => setGenSettings({...genSettings, address: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold resize-none"
                    placeholder="Ex: Plateau, Rue des Banques, Immeuble Horizon..."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Enregistrer les Paramètres
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
