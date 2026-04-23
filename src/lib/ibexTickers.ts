export interface TickerMeta {
  ticker: string;
  name: string;
  sector: string;
}

// IBEX 35 constituents available in the imported dataset
export const IBEX_TICKERS: TickerMeta[] = [
  { ticker: "IBEX", name: "IBEX 35 Index", sector: "Index" },
  { ticker: "SAN", name: "Banco Santander", sector: "Banking" },
  { ticker: "BBVA", name: "BBVA", sector: "Banking" },
  { ticker: "CABK", name: "CaixaBank", sector: "Banking" },
  { ticker: "BKT", name: "Bankinter", sector: "Banking" },
  { ticker: "SAB", name: "Banco Sabadell", sector: "Banking" },
  { ticker: "IBE", name: "Iberdrola", sector: "Utilities" },
  { ticker: "ELE", name: "Endesa", sector: "Utilities" },
  { ticker: "ENG", name: "Enagás", sector: "Utilities" },
  { ticker: "REP", name: "Repsol", sector: "Energy" },
  { ticker: "TEF", name: "Telefónica", sector: "Telecom" },
  { ticker: "ITX", name: "Inditex", sector: "Retail" },
  { ticker: "ACS", name: "ACS Group", sector: "Construction" },
  { ticker: "ANA", name: "Acciona", sector: "Infrastructure" },
  { ticker: "FER", name: "Ferrovial", sector: "Infrastructure" },
  { ticker: "ACX", name: "Acerinox", sector: "Materials" },
  { ticker: "MTS", name: "ArcelorMittal", sector: "Materials" },
  { ticker: "GRF", name: "Grifols", sector: "Healthcare" },
  { ticker: "PHM", name: "PharmaMar", sector: "Healthcare" },
  { ticker: "AMS", name: "Amadeus IT Group", sector: "Technology" },
  { ticker: "CLNX", name: "Cellnex Telecom", sector: "Telecom" },
  { ticker: "AENA", name: "Aena", sector: "Infrastructure" },
  { ticker: "IAG", name: "IAG", sector: "Aviation" },
  { ticker: "MEL", name: "Meliá Hotels", sector: "Hospitality" },
  { ticker: "MAP", name: "Mapfre", sector: "Insurance" },
  { ticker: "COL", name: "Colonial", sector: "Real Estate" },
  { ticker: "MRL", name: "Merlin Properties", sector: "Real Estate" },
  { ticker: "FDR", name: "Fluidra", sector: "Industrial" },
];

export const getTickerMeta = (t: string) =>
  IBEX_TICKERS.find((x) => x.ticker === t) || { ticker: t, name: t, sector: "—" };
