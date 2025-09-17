import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface EnergyFiltersProps {
  energySource: string;
  setEnergySource: (value: string) => void;
  submarket: string;
  setSubmarket: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  availableYears?: string[];
  availableEnergySource?: string[];
  availableSubmarkets?: string[];
}

const ENERGY_SOURCES = ["Convencional", "Incentivada 50%", "Todas as Fontes"];
const SUBMARKETS = ["N", "NE", "SE", "S", "Todos os Submercados"];
const YEARS = ["2025", "2026", "2027"];

export function EnergyFilters({
  energySource,
  setEnergySource,
  submarket,
  setSubmarket,
  year,
  setYear,
  availableYears,
  availableEnergySource,
  availableSubmarkets,
}: EnergyFiltersProps) {
  // Use dynamic data when available, fallback to hardcoded values
  const energySources = availableEnergySource || ENERGY_SOURCES;
  const submarkets = availableSubmarkets || SUBMARKETS;
  const years = availableYears || YEARS;
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Fonte de Energia</label>
        <Select value={energySource} onValueChange={setEnergySource}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {energySources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Submercado</label>
        <Select value={submarket} onValueChange={setSubmarket}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Selecione o submercado" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {submarkets.map((market) => (
              <SelectItem key={market} value={market}>
                {market}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Ano</label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {years.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <Badge variant="outline" className="text-primary border-primary">
          {energySource} | {submarket} | {year}
        </Badge>
      </div>
    </div>
  );
}