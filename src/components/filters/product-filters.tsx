import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    year: number;
    selectedProducts: string[];
  }) => void;
  availableYears: number[];
}

export function ProductFilters({ onFiltersChange, availableYears }: ProductFiltersProps) {
  const [year, setYear] = useState<number>(availableYears[0] || new Date().getFullYear());
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['todos']);

  const productOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'energia', label: 'Energia' },
    { value: 'convencional', label: 'Convencional' },
    { value: 'incentivada', label: 'Incentivada' },
    { value: 'seSubmarket', label: 'Sudeste/Centro-Oeste' },
    { value: 'sSubmarket', label: 'Sul' },
    { value: 'neSubmarket', label: 'Nordeste' },
    { value: 'nSubmarket', label: 'Norte' },
  ];

  useEffect(() => {
    onFiltersChange({
      year,
      selectedProducts,
    });
  }, [year, selectedProducts, onFiltersChange]);

  const handleProductChange = (value: string) => {
    if (value === 'todos') {
      setSelectedProducts(['todos']);
    } else {
      setSelectedProducts([value]);
    }
  };

  const getDisplayValue = () => {
    if (selectedProducts.includes('todos')) {
      return 'Todos';
    }
    const selected = productOptions.find(option => selectedProducts.includes(option.value));
    return selected ? selected.label : 'Selecione um produto';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="products">Produtos</Label>
            <Select value={selectedProducts[0] || 'todos'} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os produtos">
                  {getDisplayValue()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {productOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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