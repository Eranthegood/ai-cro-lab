import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StreamingChatInterface } from '@/components/knowledge-vault/StreamingChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Database, Target, TrendingUp } from 'lucide-react';

export default function AIInsightsV2() {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Intelligence Contextuelle",
      description: "Analyse automatique des données pertinentes selon vos questions"
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Parsing Intelligent",
      description: "Extraction et traitement automatique de tous types de fichiers"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Insights Actionnables",
      description: "Recommandations concrètes basées sur vos données réelles"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Analyse Prédictive",
      description: "Tendances et prédictions pour optimiser vos performances"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Insights V2</h1>
            <p className="text-muted-foreground mt-2">
              Intelligence Collective avancée avec parsing automatique et context intelligent
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            Version 2.0
          </Badge>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Chat Interface */}
        <StreamingChatInterface />

        {/* Info Footer */}
        <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Comment ça marche</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <strong>1. Analyse Contextuelle</strong><br />
                L'IA identifie automatiquement les fichiers pertinents selon votre question
              </div>
              <div>
                <strong>2. Parsing Intelligent</strong><br />
                Extraction et structuration automatique des données (CSV, JSON, documents)
              </div>
              <div>
                <strong>3. Réponse Enrichie</strong><br />
                Insights actionnables basés sur vos données réelles avec gestion des tokens
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}