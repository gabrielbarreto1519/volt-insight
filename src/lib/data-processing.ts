import * as XLSX from 'xlsx';

export interface NetPosition {
  year: number;
  month: number;
  maturation: string;
  energySourceDescription: string;
  submarketDescription: string;
  netVolume: number;
  MtM: number;
  profitLoss: number;
  buyPmix: number;
  sellPmix: number;
  faceValue: number;
}

export interface PmixData {
  year: number;
  month: number;
  energySourceDescription: string;
  submarketDescription: string;
  buyPmix: number;
  sellPmix: number;
  netVolumn: number;
}

export interface RiskData {
  year: number;
  month: number;
  energyVolumn: number;
  sourceVolumn: number;
  conVolumn: number;
  VaR_total: number;
  CVaR_total: number;
  VaR_energy: number;
  CVaR_energy: number;
  VaR_source: number;
  CVaR_source: number;
  VaR_submarket: number;
  CVaR_submarket: number;
  profitLossTotal_VaR: number;
  profitLossTotal_CVaR: number;
  percentageVaRenergy: number;
  percentageVaRsubmarket: number;
  percentageVaRsource: number;
  percentageCVaRenergy: number;
  percentageCVaRsubmarket: number;
  percentageCVaRsource: number;
  faceValue: number;
  seSubmarketVolumn?: number;
  sSubmarketVolumn?: number;
  nSubmarketVolumn?: number;
  neSubmarketVolumn?: number;
}

export interface CounterpartyData {
  counterparty: string;
  year: number;
  month: number;
  submarketDescription: string;
  netVolume: number;
  faceValue: number;
  MtM: number;
  profitLoss: number;
}

export interface ProductData {
  year: number;
  month: number;
  maturation: string;
  n_hours: number;
  energyVolumn: number;
  sourceVolumn: number;
  conVolumn: number;
  nSubmarketVolumn: number;
  neSubmarketVolumn: number;
  seSubmarketVolumn: number;
  sSubmarketVolumn: number;
  faceValue: number;
  mtm: number;
  profitLoss: number;
}

export const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function processNetData(data: any[]): NetPosition[] {
  return data.map(row => ({
    year: row.year || 0,
    month: row.month || 0,
    maturation: row.maturation || '',
    energySourceDescription: row.energySourceDescription || '',
    submarketDescription: row.submarketDescription || '',
    netVolume: parseFloat(row.netVolume) || 0,
    MtM: parseFloat(row.MtM) || 0,
    profitLoss: parseFloat(row.profitLoss) || 0,
    buyPmix: parseFloat(row.buyPmix) || 0,
    sellPmix: parseFloat(row.sellPmix) || 0,
    faceValue: parseFloat(row.faceValue) || 0,
  }));
}

export function processPmixData(data: any[]): PmixData[] {
  return data.map(row => ({
    year: row.year || 0,
    month: row.month || 0,
    energySourceDescription: row.energySourceDescription || '',
    submarketDescription: row.submarketDescription || '',
    buyPmix: parseFloat(row.buyPmix) || 0,
    sellPmix: parseFloat(row.sellPmix) || 0,
    netVolumn: parseFloat(row.netVolumn) || 0,
  }));
}

export function processRiskData(data: any[]): RiskData[] {
  return data.map(row => ({
    year: row.year || 0,
    month: row.month || 0,
    energyVolumn: parseFloat(row.energyVolumn) || 0,
    sourceVolumn: parseFloat(row.sourceVolumn) || 0,
    conVolumn: parseFloat(row.conVolumn) || 0,
    VaR_total: parseFloat(row.VaR_total) || 0,
    CVaR_total: parseFloat(row.CVaR_total) || 0,
    VaR_energy: parseFloat(row.VaR_energy) || 0,
    CVaR_energy: parseFloat(row.CVaR_energy) || 0,
    VaR_source: parseFloat(row.VaR_source) || 0,
    CVaR_source: parseFloat(row.CVaR_source) || 0,
    VaR_submarket: parseFloat(row.VaR_submarket) || 0,
    CVaR_submarket: parseFloat(row.CVaR_submarket) || 0,
    profitLossTotal_VaR: parseFloat(row.profitLossTotal_VaR) || 0,
    profitLossTotal_CVaR: parseFloat(row.profitLossTotal_CVaR) || 0,
    percentageVaRenergy: parseFloat(row.percentageVaRenergy) || 0,
    percentageVaRsubmarket: parseFloat(row.percentageVaRsubmarket) || 0,
    percentageVaRsource: parseFloat(row.percentageVaRsource) || 0,
    percentageCVaRenergy: parseFloat(row.percentageCVaRenergy) || 0,
    percentageCVaRsubmarket: parseFloat(row.percentageCVaRsubmarket) || 0,
    percentageCVaRsource: parseFloat(row.percentageCVaRsource) || 0,
    faceValue: parseFloat(row.faceValue) || 0,
    seSubmarketVolumn: parseFloat(row.seSubmarketVolumn) || 0,
    sSubmarketVolumn: parseFloat(row.sSubmarketVolumn) || 0,
    nSubmarketVolumn: parseFloat(row.nSubmarketVolumn) || 0,
    neSubmarketVolumn: parseFloat(row.neSubmarketVolumn) || 0,
  }));
}

export function processCounterpartyData(data: any[]): CounterpartyData[] {
  return data.map(row => ({
    counterparty: row.counterparty || '',
    year: row.year || 0,
    month: row.month || 0,
    submarketDescription: row.submarketDescription || '',
    netVolume: parseFloat(row.netVolume) || 0,
    faceValue: parseFloat(row.faceValue) || 0,
    MtM: parseFloat(row.MtM) || 0,
    profitLoss: parseFloat(row.profitLoss) || 0,
  }));
}

export function processProductData(data: any[]): ProductData[] {
  return data.map(item => ({
    year: parseInt(item.year) || 0,
    month: parseInt(item.month) || 0,
    maturation: item.maturation || '',
    n_hours: parseFloat(item.n_hours) || 0,
    energyVolumn: parseFloat(item.energyVolumn) || 0,
    sourceVolumn: parseFloat(item.sourceVolumn) || 0,
    conVolumn: parseFloat(item.conVolumn) || 0,
    nSubmarketVolumn: parseFloat(item.nSubmarketVolumn) || 0,
    neSubmarketVolumn: parseFloat(item.neSubmarketVolumn) || 0,
    seSubmarketVolumn: parseFloat(item.seSubmarketVolumn) || 0,
    sSubmarketVolumn: parseFloat(item.sSubmarketVolumn) || 0,
    faceValue: parseFloat(item.faceValue) || 0,
    mtm: parseFloat(item.mtm) || 0,
    profitLoss: parseFloat(item.profitLoss) || 0,
  }));
}

export function fillMissingMonths<T extends { month: number; year: number }>(
  data: T[],
  year: number,
  defaultValue: Omit<T, 'month' | 'year'>
): T[] {
  const result: T[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const existingData = data.find(d => d.month === month);
    if (existingData) {
      result.push(existingData);
    } else {
      result.push({
        ...defaultValue,
        month,
        year,
      } as T);
    }
  }
  
  return result;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export async function loadExcelFile(filename: string): Promise<any[]> {
  try {
    const response = await fetch(`/data/${filename}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    console.error(`Erro ao carregar arquivo ${filename}:`, error);
    return [];
  }
}

export function getMonthName(month: number): string {
  return MONTHS[month - 1] || 'N/A';
}

export function aggregateByYear(data: any[], valueField: string): number {
  return data.reduce((sum, item) => sum + (parseFloat(item[valueField]) || 0), 0);
}