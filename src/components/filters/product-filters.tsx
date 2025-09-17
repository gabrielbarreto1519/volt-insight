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
      const newSelection = selectedProducts.includes('todos') 
        ? [value]
        : selectedProducts.includes(value)
          ? selectedProducts.filter(p => p !== value)
          : [...selectedProducts, value];
      
      setSelectedProducts(newSelection.length === 0 ? ['todos'] : newSelection);
    }
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
            <div className="flex flex-wrap gap-2">
              {productOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(option.value)}
                    onChange={() => handleProductChange(option.value)}
                    className="rounded border-border"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}