import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditRiskTab } from '@/components/tabs/credit-risk-tab';
import { CounterpartyProductPositionsTab } from '@/components/tabs/counterparty-product-positions-tab';

export function CreditRiskWithSubtabs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Posições Bilaterais</h2>
      
      <Tabs defaultValue="bilateral" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="bilateral" className="font-medium">
            Posições Bilaterais
          </TabsTrigger>
          <TabsTrigger value="products" className="font-medium">
            Posições Bilaterais em Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bilateral" className="space-y-6">
          <CreditRiskTab />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <CounterpartyProductPositionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}