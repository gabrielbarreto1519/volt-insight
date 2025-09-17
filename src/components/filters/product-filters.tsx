import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    year: number;
    productDimension: 'energia' | 'fonte' | 'submercado';
    submarketType?: 'N' | 'NE' | 'SE' | 'S';
    maturation?: string;
  }) => void;
  availableYears: number[];
  availableMaturations: string[];
}

export function ProductFilters({ onFiltersChange, availableYears, availableMaturations }: ProductFiltersProps) {
  const [year, setYear] = useState<number>(availableYears[0] || new Date().getFullYear());
  const [productDimension, setProductDimension] = useState<'energia' | 'fonte' | 'submercado'>('energia');
  const [submarketType, setSubmarketType] = useState<'N' | 'NE' | 'SE' | 'S'>('N');
  const [maturation, setMaturation] = useState<string>('all');

  useEffect(() => {
    onFiltersChange({
      year,
      productDimension,
      submarketType: productDimension === 'submercado' ? submarketType : undefined,
      maturation: maturation === 'all' ? undefined : maturation,
    });
  }, [year, productDimension, submarketType, maturation, onFiltersChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-dimension">Dimensão de Produto</Label>
            <Select value={productDimension} onValueChange={(value: 'energia' | 'fonte' | 'submercado') => setProductDimension(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dimensão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="energia">Energia</SelectItem>
                <SelectItem value="fonte">Fonte (Convencional/Incentivada)</SelectItem>
                <SelectItem value="submercado">Submercado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {productDimension === 'submercado' && (
            <div className="space-y-2">
              <Label htmlFor="submarket-type">Tipo de Submercado</Label>
              <Select value={submarketType} onValueChange={(value: 'N' | 'NE' | 'SE' | 'S') => setSubmarketType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o submercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N">Norte (N)</SelectItem>
                  <SelectItem value="NE">Nordeste (NE)</SelectItem>
                  <SelectItem value="SE">Sudeste (SE)</SelectItem>
                  <SelectItem value="S">Sul (S)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maturation">Maturação (Opcional)</Label>
            <Select value={maturation} onValueChange={setMaturation}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as maturações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableMaturations.map((mat) => (
                  <SelectItem key={mat} value={mat}>
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}