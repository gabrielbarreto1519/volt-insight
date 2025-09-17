import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface RiskFiltersProps {
  year: string;
  setYear: (value: string) => void;
  produto: string;
  setProduto: (value: string) => void;
  isVaR: boolean;
  setIsVaR: (value: boolean) => void;
}

const YEARS = ["2025", "2026", "2027"];
const PRODUTOS = ["Energia", "Fonte", "Submercado", "Swaps"];

export function RiskFilters({
  year,
  setYear,
  produto,
  setProduto,
  isVaR,
  setIsVaR,
}: RiskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
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

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Produto</label>
        <Select value={produto} onValueChange={setProduto}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {PRODUTOS.map((prod) => (
              <SelectItem key={prod} value={prod}>
                {prod}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-muted-foreground">Medida de Risco</Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor="risk-toggle" className="text-sm">
            {isVaR ? "VaR95" : "CVaR95"}
          </Label>
          <Switch
            id="risk-toggle"
            checked={!isVaR}
            onCheckedChange={(checked) => setIsVaR(!checked)}
          />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Badge variant="outline" className="text-primary border-primary">
          {year} | {produto} | {isVaR ? "VaR95" : "CVaR95"}
        </Badge>
      </div>
    </div>
  );
}