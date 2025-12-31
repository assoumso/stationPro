
import React, { useState } from 'react';
import { StationData, Expense } from '../types';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import AutocompleteSelect from './AutocompleteSelect';

interface ExpenseManagementProps {
  data: StationData;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ data, onAddExpense, onDeleteExpense }) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Salaires');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || amount <= 0) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      label,
      amount,
      category,
      date: new Date().toISOString()
    };

    onAddExpense(newExpense);
    setLabel('');
    setAmount(0);
  };

  const categoryOptions = [
    { id: 'Salaires', label: 'Salaires' },
    { id: 'Énergie', label: 'Énergie & Eau' },
    { id: 'Entretien', label: 'Maintenance / Entretien' },
    { id: 'Taxes', label: 'Taxes & Impôts' },
    { id: 'Fournitures', label: 'Fournitures' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Plus size={20} className="text-red-500" /> Saisir Dépense
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Libellé</label>
            <input 
              type="text" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Facture Électricité"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
            <AutocompleteSelect 
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Choisir une catégorie..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant (FCFA)</label>
            <input 
              type="number" 
              value={amount || ''} 
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
          >
            Enregistrer la dépense
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <CreditCard size={18} className="text-slate-400" /> Registre des Dépenses
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-400 font-bold bg-slate-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Libellé</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3 text-right">Montant</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.expenses.length > 0 ? (
                [...data.expenses].reverse().map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{exp.label}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">
                      {Math.round(exp.amount).toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteExpense(exp.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Aucune dépense enregistrée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
