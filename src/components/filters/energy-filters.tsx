import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EnergyFiltersProps {
  energySource: string;
  setEnergySource: (value: string) => void;
  submarket: string;
  setSubmarket: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  isFinancialMode: boolean;
  setIsFinancialMode: (value: boolean) => void;
  availableYears?: string[];
  availableEnergySource?: string[];
  availableSubmarkets?: string[];
}

export function EnergyFilters({
  energySource,
  setEnergySource,
  submarket,
  setSubmarket,
  year,
  setYear,
  isFinancialMode,
  setIsFinancialMode,
  availableYears = ['2023', '2024', '2025'],
  availableEnergySource = ['Convencional', 'Renovável'],
  availableSubmarkets = ['N', 'S', 'SE/CO', 'NE'],
}: EnergyFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="text-sm font-medium mb-2 block">Fonte de Energia</label>
            <Select value={energySource} onValueChange={setEnergySource} disabled={isFinancialMode}>
              <SelectTrigger className="bg-background border-border z-50">
                <SelectValue placeholder="Selecione a fonte" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                {availableEnergySource.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Submercado</label>
            <Select value={submarket} onValueChange={setSubmarket} disabled={isFinancialMode}>
              <SelectTrigger className="bg-background border-border z-50">
                <SelectValue placeholder="Selecione o submercado" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                {availableSubmarkets.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Ano</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-background border-border z-50">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border shadow-lg z-50">
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 ml-6">
          <Label htmlFor="financial-mode" className="text-sm font-medium">
            Modo
          </Label>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!isFinancialMode ? 'font-medium' : 'text-muted-foreground'}`}>
              Físico
            </span>
            <Switch
              id="financial-mode"
              checked={isFinancialMode}
              onCheckedChange={setIsFinancialMode}
            />
            <span className={`text-sm ${isFinancialMode ? 'font-medium' : 'text-muted-foreground'}`}>
              Financeiro
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="px-3 py-1">
          {isFinancialMode ? 'Financeiro' : `${energySource} • ${submarket}`} • {year}
        </Badge>
      </div>
    </div>
  );
}