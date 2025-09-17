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
}

const YEARS = ["2025", "2026", "2027"];
const SUBMARKETS = ["N", "NE", "SE", "S"];

export function CounterpartyFilters({
  counterparty,
  setCounterparty,
  year,
  setYear,
  submarket,
  setSubmarket,
  availableCounterparties,
}: CounterpartyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Contraparte</label>
        <Select value={counterparty} onValueChange={setCounterparty}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecione a contraparte" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectContent>
            {YEARS.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {setSubmarket && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Submercado (Opcional)</label>
          <Select value={submarket || ""} onValueChange={setSubmarket}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Selecione o submercado" />
            </SelectTrigger>
            <SelectContent>
              {SUBMARKETS.map((market) => (
                <SelectItem key={market} value={market}>
                  {market}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Badge variant="outline" className="text-primary border-primary">
          {counterparty} | {year}
          {submarket && ` | ${submarket}`}
        </Badge>
      </div>
    </div>
  );
}