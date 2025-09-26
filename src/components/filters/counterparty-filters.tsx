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
// Removed YEARS_WITH_ALL - 'Todos' handled as separate option with value '__ALL__'
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
  // Normalize, deduplicate, and sort years; "Todos" injected as dedicated option
  const normalizedYears = (availableYears && availableYears.length > 0 ? availableYears : YEARS)
    .map((y) => y.toString().trim())
    .filter((y) => y && y.toLowerCase() !== 'todos');
  const years = Array.from(new Set(normalizedYears)).sort();
  const selectedYearValue = year?.toString().trim().toLowerCase() === 'todos' || year?.toString().trim().toLowerCase() === '__all__' ? '__ALL__' : year;
  const handleYearChange = (val: string) => setYear(val === '__ALL__' ? '__ALL__' : val);
  const displayYearLabel = selectedYearValue === '__ALL__' ? 'Todos' : year;
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
        <Select value={selectedYearValue} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent 
            sideOffset={4}
            className="max-h-[300px] overflow-y-auto z-[1000]"
          >
            <SelectItem key="year-__ALL__" value="__ALL__">Todos</SelectItem>
            {years.map((yr) => (
              <SelectItem key={`year-${yr}`} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="flex items-end gap-2">
        <Badge variant="outline" className="text-primary border-primary">
          {counterparty} | {displayYearLabel}
        </Badge>
      </div>
    </div>
  );
}