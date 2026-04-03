import { CARS1 } from "./cars1";
import { CARS2 } from "./cars2";

export const CARS = [...CARS1, ...CARS2];

export const BRANDS = ["Tutti", ...[...new Set(CARS.map((c) => c.brand))].sort()];
export const CATS = ["Tutti", "Citycar", "Berlina", "SUV", "Commerciale"];
export const FUELS = ["Tutti", "Benzina", "Diesel", "Ibrido", "Plug-in", "Elettrico"];
export const FI = { Benzina: "⛽", Diesel: "🛢", Ibrido: "🌿", "Plug-in": "🔌", Elettrico: "⚡" };
export const FC = {
  Benzina: "#F59E0B",
  Diesel: "#6B7280",
  Ibrido: "#10B981",
  "Plug-in": "#8B5CF6",
  Elettrico: "#3B82F6",
};
export const TC = {
  "✅ In linea": { bg: "#F0FDF4", br: "#A7F3D0", c: "#065F46" },
  "💰 Migliorativo prezzo": { bg: "#EFF6FF", br: "#BFDBFE", c: "#1E40AF" },
  "⭐ Migliorativo allestimento": { bg: "#FFF7ED", br: "#FED7AA", c: "#92400E" },
};
export const MOCK_OFFERS = [
  {
    id: "O1", canone: 559, anticipo: 1500, durata: 36, km: 20000, carburante: "Benzina",
    tipo: "✅ In linea", note: "Disponibile in 6 settimane, manutenzione inclusa", delay: 4000,
    allestimento: "Business Plus · pack winter", colore: "Grigio Daytona metallizzato",
    manutenzione: "Ordinaria e straordinaria programmata",
    assic: { kasko: true, franchigia: 500, rca: true, assist: "H24", pneumatici: true, autoSost: true },
  },
  {
    id: "O2", canone: 539, anticipo: 0, durata: 36, km: 20000, carburante: "Benzina",
    tipo: "💰 Migliorativo prezzo", note: "Zero anticipo, sconto speciale questo mese", delay: 9000,
    allestimento: "Base · tetto fisso", colore: "Bianco Alpino",
    manutenzione: "Solo tagliandi ordinari",
    assic: { kasko: true, franchigia: 800, rca: true, assist: "H24", pneumatici: false, autoSost: false },
  },
  {
    id: "O3", canone: 579, anticipo: 1000, durata: 36, km: 20000, carburante: "Benzina",
    tipo: "⭐ Migliorativo allestimento", note: "Cerchi 19 pollici e tetto apribile inclusi", delay: 16000,
    allestimento: "M Sport · cerchi 19\" · tetto panoramico", colore: "Nero Saphir",
    manutenzione: "Completa + usura pneumatici 36 mesi",
    assic: { kasko: true, franchigia: 350, rca: true, assist: "H24 premium", pneumatici: true, autoSost: true },
  },
];
export const ALL_BRANDS_D = [
  "Alfa Romeo", "Audi", "BMW", "Fiat", "Ford", "Jeep", "Kia",
  "Mercedes", "Peugeot", "Renault", "Tesla", "Toyota", "Volkswagen", "Volvo",
];
export const genCodice = () => "BRO-" + Math.random().toString(36).slice(2, 6).toUpperCase();
