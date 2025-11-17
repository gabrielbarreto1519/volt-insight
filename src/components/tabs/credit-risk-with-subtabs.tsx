import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BilateralRiskTab } from '@/components/tabs/bilateral-risk-tab';
import { PortfolioRiskTab } from '@/components/tabs/portfolio-risk-tab';

export function CreditRiskWithSubtabs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Risco de Crédito</h2>
      
      <Tabs defaultValue="bilateral" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="bilateral" className="font-medium">
            Risco Bilateral
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="font-medium">
            Risco de Portfólio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bilateral" className="space-y-6">
          <BilateralRiskTab />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioRiskTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}