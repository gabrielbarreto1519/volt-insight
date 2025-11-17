import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetPositionsWithSubtabs } from '@/components/tabs/net-positions-with-subtabs';
import { CreditRiskWithSubtabs } from '@/components/tabs/credit-risk-with-subtabs';
import { MarketRiskTab } from '@/components/tabs/market-risk-tab';
import { BarChart3, Shield, TrendingUp } from 'lucide-react';
import alupLogo from '@/assets/alup-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Alup Logo */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            {/* Alup Logo */}
            <div className="flex-shrink-0">
              <img 
                src={alupLogo} 
                alt="Alup" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl alup-title-primary font-hanken">
                Gestão de Portfólio de Energia
              </h1>
              <p className="alup-subtitle font-hanken mt-1">
                Sistema de análise e monitoramento de posições energéticas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="positions" className="flex items-center gap-2 font-hanken font-semibold">
              <BarChart3 className="w-4 h-4" />
              Posições Líquidas
            </TabsTrigger>
            <TabsTrigger value="credit-risk" className="flex items-center gap-2 font-hanken font-semibold">
              <Shield className="w-4 h-4" />
              Risco de Crédito
            </TabsTrigger>
            <TabsTrigger value="market-risk" className="flex items-center gap-2 font-hanken font-semibold">
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
          <div className="text-center text-sm alup-body font-hanken">
            © 2024 Alup - Sistema de Gestão de Portfólio de Energia. Dados atualizados em tempo real.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;