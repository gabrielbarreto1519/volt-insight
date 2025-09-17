import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetPositionsTab } from '@/components/tabs/net-positions-tab';
import { ProductPositionsTab } from '@/components/tabs/product-positions-tab';

export function NetPositionsWithSubtabs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Posições Líquidas</h2>
      
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="positions" className="font-medium">
            Posições Líquidas
          </TabsTrigger>
          <TabsTrigger value="products" className="font-medium">
            Posições Líquidas em Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-6">
          <NetPositionsTab />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductPositionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}