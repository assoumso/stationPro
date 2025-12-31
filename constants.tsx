
import { StationData } from './types';

export const INITIAL_DATA: StationData = {
  tanks: [
    { id: 't1', fuelType: 'Essence', capacity: 20000, currentLevel: 15000, criticalLevel: 2000 },
    { id: 't2', fuelType: 'Diesel', capacity: 30000, currentLevel: 22000, criticalLevel: 3000 },
  ],
  pumps: [
    { id: 'p1', name: 'Pompe 01', tankId: 't1', fuelType: 'Essence', lastIndex: 124500 },
    { id: 'p2', name: 'Pompe 02', tankId: 't1', fuelType: 'Essence', lastIndex: 98200 },
    { id: 'p3', name: 'Pompe 03', tankId: 't2', fuelType: 'Diesel', lastIndex: 350100 },
  ],
  products: [
    { id: 'prod1', name: 'Huile Moteur 5W30', category: 'Lubrifiants', purchasePrice: 15000, salePrice: 25000, stock: 45, minStock: 10 },
    { id: 'prod2', name: 'Lave Glace 5L', category: 'Entretien', purchasePrice: 3000, salePrice: 5000, stock: 8, minStock: 15 },
    { id: 'prod3', name: 'Eau Minérale 1.5L', category: 'Boutique', purchasePrice: 300, salePrice: 600, stock: 120, minStock: 24 },
  ],
  shifts: [],
  sales: [],
  expenses: [],
  restocks: [],
  fuelPrices: {
    Essence: 750,
    Diesel: 720,
    Super: 800,
    LPG: 450,
  },
  settings: {
    stationName: "Station Pro Centre-Ville",
    managerName: "Jean Dupont",
    phone: "+225 01 02 03 04 05",
    email: "contact@stationpro.ci",
    address: "Rue du Commerce, Plateau, Abidjan",
    currency: "FCFA",
    openingHours: "24h/24, 7j/7"
  }
};
