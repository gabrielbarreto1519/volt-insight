import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetPositionsWithSubtabs } from '@/components/tabs/net-positions-with-subtabs';
import { CreditRiskWithSubtabs } from '@/components/tabs/credit-risk-with-subtabs';
import { MarketRiskTab } from '@/components/tabs/market-risk-tab';
import { BarChart3, Shield, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Portfólio de Energia</h1>
                <p className="text-sm text-muted-foreground">Sistema de análise e monitoramento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Posições Líquidas
            </TabsTrigger>
            <TabsTrigger value="credit-risk" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Posições Bilaterais
            </TabsTrigger>
            <TabsTrigger value="market-risk" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Risco de Mercado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-6">
            <NetPositionsWithSubtabs />
          </TabsContent>

          <TabsContent value="credit-risk" className="space-y-6">
            <CreditRiskWithSubtabs />
          </TabsContent>

          <TabsContent value="market-risk" className="space-y-6">
            <MarketRiskTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 Sistema de Gestão de Portfólio de Energia. Dados atualizados em tempo real.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;