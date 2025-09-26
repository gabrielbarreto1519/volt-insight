import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CounterpartyProductFiltersProps {
  counterparty: string;
  setCounterparty: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (value: string[]) => void;
  availableCounterparties: string[];
  availableYears: string[];
}

const productOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'energia', label: 'Energia' },
  { value: 'convencional', label: 'Convencional' },
  { value: 'incentivada', label: 'Incentivada 50%' },
  { value: 'seSubmarket', label: 'Sudeste/Centro-Oeste' },
  { value: 'sSubmarket', label: 'Sul' },
  { value: 'neSubmarket', label: 'Nordeste' },
  { value: 'nSubmarket', label: 'Norte' },
];

export function CounterpartyProductFilters({
  counterparty,
  setCounterparty,
  year,
  setYear,
  selectedProducts,
  setSelectedProducts,
  availableCounterparties,
  availableYears,
}: CounterpartyProductFiltersProps) {
  // Remove duplicates and ensure "Todos" is first
  const filteredYears = availableYears.filter(year => year !== 'Todos');
  const yearsWithAll = ["Todos", ...filteredYears];
  
  const handleProductChange = (value: string) => {
    if (value === 'todos') {
      setSelectedProducts(['todos']);
    } else {
      setSelectedProducts([value]);
    }
  };

  const getProductDisplayValue = () => {
    if (selectedProducts.includes('todos')) {
      return 'Todos';
    }
    const selected = productOptions.find(option => selectedProducts.includes(option.value));
    return selected ? selected.label : 'Selecione um produto';
  };
  
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
            {yearsWithAll.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Produtos</label>
        <Select value={selectedProducts[0] || 'todos'} onValueChange={handleProductChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione os produtos">
              {getProductDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent 
            sideOffset={4}
            className="max-h-[300px] overflow-y-auto z-[1000]"
          >
            {productOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <Badge variant="outline" className="text-primary border-primary">
          {counterparty} | {year} | {getProductDisplayValue()}
        </Badge>
      </div>
    </div>
  );
}