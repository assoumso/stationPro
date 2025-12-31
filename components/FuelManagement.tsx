
import React, { useState } from 'react';
import { StationData, ShiftRecord, Pump } from '../types';
import { Fuel, RefreshCw, Save, ArrowRight, AlertCircle } from 'lucide-react';
import AutocompleteSelect from './AutocompleteSelect';

interface FuelManagementProps {
  data: StationData;
  onCompleteShift: (shift: ShiftRecord, tankId: string, pumpId: string, endIndex: number) => void;
}

const FuelManagement: React.FC<FuelManagementProps> = ({ data, onCompleteShift }) => {
  const [selectedPumpId, setSelectedPumpId] = useState<string>(data.pumps[0]?.id || '');
  const [endIndex, setEndIndex] = useState<number | string>('');
  const [error, setError] = useState<string | null>(null);

  const selectedPump = data.pumps.find(p => p.id === selectedPumpId);
  const currentPrice = selectedPump ? data.fuelPrices[selectedPump.fuelType] : 0;
  
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const endIdxNum = Number(endIndex);

    if (!selectedPump) {
      setError("Veuillez sélectionner une pompe valide.");
      return;
    }

    if (!endIndex || endIdxNum <= selectedPump.lastIndex) {
      setError(`L'index de fin doit être strictement supérieur à l'index actuel (${selectedPump.lastIndex}).`);
      return;
    }

    const volume = endIdxNum - selectedPump.lastIndex;
    const amount = volume * currentPrice;

    const newShift: ShiftRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      pumpId: selectedPump.id,
      startIndex: selectedPump.lastIndex,
      endIndex: endIdxNum,
      volumeSold: volume,
      unitPrice: currentPrice,
      totalAmount: amount
    };

    try {
      onCompleteShift(newShift, selectedPump.tankId, selectedPump.id, endIdxNum);
      setEndIndex('');
      alert("Relevé d'index enregistré avec succès !");
    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement.");
      console.error(err);
    }
  };

  const calculatedVolume = (Number(endIndex) || 0) - (selectedPump?.lastIndex || 0);

  const pumpOptions = data.pumps.map(p => ({
    id: p.id,
    label: p.name,
    sublabel: p.fuelType
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <RefreshCw size={20} className="text-emerald-500" /> Nouveau Relevé (Index)
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveShift} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sélectionner la Pompe</label>
            <AutocompleteSelect 
              options={pumpOptions}
              value={selectedPumpId}
              onChange={(val) => {
                setSelectedPumpId(val);
                setEndIndex('');
                setError(null);
              }}
              placeholder="Choisir une pompe..."
            />
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Index Actuel (Début)</p>
              <p className="text-xl font-bold text-emerald-900">{selectedPump?.lastIndex.toLocaleString()}</p>
            </div>
            <Fuel className="text-emerald-300" size={32} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nouvel Index de Fin</label>
            <input 
              type="number" 
              value={endIndex} 
              onChange={(e) => setEndIndex(e.target.value)}
              placeholder="Entrer le nouveau compteur"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Volume calculé :</span>
              <span className={`font-semibold ${calculatedVolume > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {calculatedVolume > 0 ? calculatedVolume.toLocaleString() : 0} L
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Prix unitaire :</span>
              <span className="font-semibold">{Math.round(currentPrice).toLocaleString()} FCFA/L</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 mt-2 pt-2">
              <span className="text-slate-700">Total :</span>
              <span className="text-emerald-600">
                {Math.round(calculatedVolume > 0 ? calculatedVolume * currentPrice : 0).toLocaleString()} FCFA
              </span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save size={20} /> Valider le Relevé
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">Historique des Ventes Carburant</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-400 font-bold bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Pompe</th>
                  <th className="px-6 py-3">Volume</th>
                  <th className="px-6 py-3">Index (D/F)</th>
                  <th className="px-6 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.shifts.length > 0 ? (
                  [...data.shifts].reverse().slice(0, 10).map((shift) => {
                    const pump = data.pumps.find(p => p.id === shift.pumpId);
                    return (
                      <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(shift.timestamp).toLocaleDateString()} {new Date(shift.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 font-medium">{pump?.name}</td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">{shift.volumeSold.toLocaleString()} L</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{shift.startIndex.toLocaleString()} <ArrowRight size={12} className="inline mx-1" /> {shift.endIndex.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold">{Math.round(shift.totalAmount).toLocaleString()} FCFA</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Aucun relevé d'index enregistré</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelManagement;
