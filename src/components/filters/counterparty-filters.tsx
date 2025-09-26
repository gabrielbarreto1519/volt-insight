import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CounterpartyFiltersProps {
  counterparty: string;
  setCounterparty: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  submarket?: string;
  setSubmarket?: (value: string) => void;
  availableCounterparties: string[];
  availableYears?: string[];
}

const YEARS = ["2025", "2026", "2027"];
const YEARS_WITH_ALL = ["Todos", ...YEARS];
const SUBMARKETS = ["N", "NE", "SE", "S"];

export function CounterpartyFilters({
  counterparty,
  setCounterparty,
  year,
  setYear,
  submarket,
  setSubmarket,
  availableCounterparties,
  availableYears,
}: CounterpartyFiltersProps) {
  // Use dynamic data when available, fallback to hardcoded values with "Todos" option
  const years = availableYears ? ["Todos", ...availableYears] : YEARS_WITH_ALL;
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Contraparte</label>
        <Select value={counterparty} onValueChange={setCounterparty}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecione a contraparte" />
          </SelectTrigger>
          <SelectContent 
            sideOffset={4}
            className="max-h-[300px] overflow-y-auto z-[1000]"
          >
            {availableCounterparties.map((cp) => (
              <SelectItem key={cp} value={cp}>
                {cp}
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
          <SelectContent 
            sideOffset={4}
            className="max-h-[300px] overflow-y-auto z-[1000]"
          >
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
          {counterparty} | {year}
        </Badge>
      </div>
    </div>
  );
}