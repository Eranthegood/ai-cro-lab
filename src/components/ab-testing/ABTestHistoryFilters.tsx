import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Filter, X, Calendar } from 'lucide-react';

interface FiltersProps {
  filters: {
    search: string;
    goalType: string;
    dateFrom: string;
    dateTo: string;
    approach: string;
    pageUrl: string;
    pageType: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const ABTestHistoryFilters = ({ filters, onFiltersChange }: FiltersProps) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      goalType: '',
      dateFrom: '',
      dateTo: '',
      approach: '',
      pageUrl: '',
      pageType: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Set default date range to last 3 months
  React.useEffect(() => {
    if (!filters.dateFrom && !filters.dateTo) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      onFiltersChange({
        ...filters,
        dateFrom: threeMonthsAgo.toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      });
    }
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters & Search</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suggestion titles..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Page Type */}
        <Select value={filters.pageType || "all"} onValueChange={(value) => updateFilter('pageType', value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Type de page" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50 max-h-60 overflow-y-auto">
            <SelectItem value="all">Toutes les pages</SelectItem>
            <SelectItem value="homepage">🏠 Page d'accueil</SelectItem>
            <SelectItem value="listing">📂 Page de catégorie</SelectItem>
            <SelectItem value="product">📦 Page produit</SelectItem>
            <SelectItem value="search">🔍 Page de recherche</SelectItem>
            <SelectItem value="cart">🛒 Page panier</SelectItem>
            <SelectItem value="checkout">💳 Page de checkout</SelectItem>
            <SelectItem value="shipping">🚚 Page de livraison</SelectItem>
            <SelectItem value="payment">💰 Page de paiement</SelectItem>
            <SelectItem value="pricing">🏷️ Page de prix</SelectItem>
            <SelectItem value="signup">✍️ Page d'inscription</SelectItem>
            <SelectItem value="login">🔐 Page de connexion</SelectItem>
            <SelectItem value="contact">📞 Page de contact</SelectItem>
            <SelectItem value="about">ℹ️ Page à propos</SelectItem>
            <SelectItem value="blog">📝 Blog/Article</SelectItem>
            <SelectItem value="landing">🎯 Landing page</SelectItem>
            <SelectItem value="dashboard">📊 Dashboard</SelectItem>
            <SelectItem value="other">📄 Autre</SelectItem>
          </SelectContent>
        </Select>

        {/* Goal Type */}
        <Select value={filters.goalType || "all"} onValueChange={(value) => updateFilter('goalType', value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Objectif" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            <SelectItem value="all">Tous les objectifs</SelectItem>
            <SelectItem value="conversion">🎯 Taux de conversion</SelectItem>
            <SelectItem value="cart">🛒 Abandon de panier</SelectItem>
            <SelectItem value="add-to-cart">🛍️ Ajout au panier</SelectItem>
            <SelectItem value="form">📝 Completion de formulaires</SelectItem>
            <SelectItem value="ctr">👆 Taux de clic</SelectItem>
            <SelectItem value="engagement">⏱️ Engagement</SelectItem>
            <SelectItem value="retention">🔄 Rétention</SelectItem>
            <SelectItem value="revenue">💰 Revenus</SelectItem>
            <SelectItem value="signup">✍️ Inscription</SelectItem>
            <SelectItem value="lead_generation">🎯 Génération de leads</SelectItem>
          </SelectContent>
        </Select>

        {/* Approach */}
        <Select value={filters.approach || "all"} onValueChange={(value) => updateFilter('approach', value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Approche" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            <SelectItem value="all">Toutes approches</SelectItem>
            <SelectItem value="Technical UX">Technical UX</SelectItem>
            <SelectItem value="Psychology">Psychology</SelectItem>
            <SelectItem value="Brand Differentiation">Brand Differentiation</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="pl-9"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="pl-9"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Page URL Filter */}
      <div className="mt-3">
        <Input
          placeholder="Filter by page URL or domain..."
          value={filters.pageUrl}
          onChange={(e) => updateFilter('pageUrl', e.target.value)}
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="h-auto p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {filters.goalType && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Goal: {filters.goalType}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('goalType', '')}
                className="h-auto p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {filters.approach && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Approach: {filters.approach}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('approach', '')}
                className="h-auto p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {filters.pageUrl && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              URL: {filters.pageUrl}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('pageUrl', '')}
                className="h-auto p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {filters.pageType && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Type: {filters.pageType}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('pageType', '')}
                className="h-auto p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};