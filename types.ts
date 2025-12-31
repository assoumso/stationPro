
export type FuelType = string;

export interface Tank {
  id: string;
  fuelType: FuelType;
  capacity: number;
  currentLevel: number;
  criticalLevel: number;
}

export interface Pump {
  id: string;
  name: string;
  tankId: string;
  fuelType: FuelType;
  lastIndex: number;
}

export interface ShiftRecord {
  id: string;
  timestamp: string;
  pumpId: string;
  startIndex: number;
  endIndex: number;
  volumeSold: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
}

export interface RestockRecord {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  timestamp: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  productId: string;
  quantity: number;
  totalPrice: number;
}

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
}

export interface GeneralSettings {
  stationName: string;
  managerName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  openingHours: string;
}

export interface StationData {
  tanks: Tank[];
  pumps: Pump[];
  products: Product[];
  shifts: ShiftRecord[];
  sales: Sale[];
  expenses: Expense[];
  restocks: RestockRecord[];
  fuelPrices: Record<FuelType, number>;
  settings: GeneralSettings;
}
