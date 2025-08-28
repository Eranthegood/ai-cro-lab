import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ABTestHistoryFilters } from "./ABTestHistoryFilters";
import { SuggestionDetailModal } from "./SuggestionDetailModal";
import { 
  Eye, 
  Download, 
  RefreshCw, 
  Search, 
  Calendar,
  ExternalLink,
  Zap,
  Brain,
  TrendingUp,
  Target,
  Globe,
  FileText
} from 'lucide-react';

interface HistoryItem {
  id: string;
  session_id: string;
  goal_type: string;
  page_url: string;
  created_at: string;
  suggestion_data: any; // Using any to handle Json type from Supabase
}

interface ABTestHistoryTableProps {
  data: HistoryItem[];
  isLoading: boolean;
  filters: {
    search: string;
    goalType: string;
    dateFrom: string;
    dateTo: string;
    approach: string;
    pageUrl: string;
  };
  onFiltersChange: (filters: any) => void;
  onExport: () => void;
  onRefresh: () => void;
}

interface GroupedSuggestion {
  id: string;
  title: string;
  approach?: string;
  problem_detected?: string;
  solution_description?: string;
  expected_impact?: string;
  psychology_insight?: string;
  difficulty?: string;
  pageUrl: string;
  goalType: string;
  createdAt: string;
  sessionId: string;
}

interface PageTypeGroup {
  pageType: string;
  suggestions: GroupedSuggestion[];
  uniquePages: Set<string>;
  totalSessions: number;
}

const SuggestionCard = ({ suggestion }: { suggestion: GroupedSuggestion }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'simple css':
      case 'easy':
      case 'simple':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium js':
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'complex integration':
      case 'complex':
      case 'hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getApproachIcon = (approach?: string) => {
    switch (approach) {
      case 'Technical UX':
        return <Zap className="h-3 w-3" />;
      case 'Psychology':
        return <Brain className="h-3 w-3" />;
      case 'Brand Differentiation':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50 h-full">
      <CardContent className="p-4">
        <div className="space-y-3 h-full flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight line-clamp-2 flex-1">{suggestion.title}</h4>
            <div className="flex gap-1 flex-shrink-0">
              {suggestion.approach && (
                <Badge variant="secondary" className="text-xs px-2 py-0 flex items-center gap-1">
                  {getApproachIcon(suggestion.approach)}
                  {suggestion.approach}
                </Badge>
              )}
            </div>
          </div>
          
          {suggestion.difficulty && (
            <Badge variant="outline" className={`text-xs px-2 py-0 w-fit ${getDifficultyColor(suggestion.difficulty)}`}>
              {suggestion.difficulty}
            </Badge>
          )}
          
          {suggestion.expected_impact && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
              <span className="font-medium">Impact:</span> {
                typeof suggestion.expected_impact === 'object' && suggestion.expected_impact !== null
                  ? (suggestion.expected_impact as any).primary_metric || 'Amélioration attendue'
                  : suggestion.expected_impact
              }
            </p>
          )}
          
          {suggestion.problem_detected && (
            <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
              <span className="font-medium">Problème:</span> {
                typeof suggestion.problem_detected === 'object' && suggestion.problem_detected !== null
                  ? (suggestion.problem_detected as any).issue || 'Problème identifié'
                  : suggestion.problem_detected
              }
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {(() => {
                  try {
                    return new URL(suggestion.pageUrl).hostname;
                  } catch {
                    return suggestion.pageUrl;
                  }
                })()}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {suggestion.goalType}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PageTypeSection = ({ group }: { group: PageTypeGroup }) => {
  const getPageTypeIcon = (pageType: string) => {
    if (pageType.includes('accueil') || pageType.includes('homepage') || pageType.includes('home')) return '🏠';
    if (pageType.includes('produit') || pageType.includes('product')) return '📦';
    if (pageType.includes('checkout') || pageType.includes('panier') || pageType.includes('cart')) return '🛒';
    if (pageType.includes('connexion') || pageType.includes('login')) return '🔐';
    if (pageType.includes('inscription') || pageType.includes('signup') || pageType.includes('register')) return '✍️';
    if (pageType.includes('prix') || pageType.includes('pricing')) return '💰';
    if (pageType.includes('contact')) return '📞';
    if (pageType.includes('propos') || pageType.includes('about')) return 'ℹ️';
    if (pageType.includes('blog') || pageType.includes('article')) return '📝';
    if (pageType.includes('recherche') || pageType.includes('search')) return '🔍';
    if (pageType.includes('dashboard') || pageType.includes('app')) return '📊';
    if (pageType.includes('landing')) return '🎯';
    if (pageType.includes('catégorie') || pageType.includes('category')) return '📂';
    return '📄';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getPageTypeIcon(group.pageType)}</span>
          <div>
            <h2 className="text-xl font-semibold">{group.pageType}</h2>
            <p className="text-sm text-muted-foreground">
              {group.suggestions.length} suggestions • {group.uniquePages.size} pages • {group.totalSessions} sessions
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {group.suggestions.length}
        </Badge>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {group.suggestions.map((suggestion, index) => (
          <SuggestionCard key={`${suggestion.sessionId}-${suggestion.id}-${index}`} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
};

export const ABTestHistoryTable = ({
  data,
  isLoading,
  filters,
  onFiltersChange,
  onExport,
  onRefresh
}: ABTestHistoryTableProps) => {
  const [selectedSession, setSelectedSession] = useState<HistoryItem | null>(null);

  // Determine page type from URL or existing data
  const determinePageType = (item: HistoryItem): string => {
    // First check if pageType is already stored in suggestion_data
    if (item.suggestion_data?.pageContext?.pageType) {
      return item.suggestion_data.pageContext.pageType;
    }
    
    // Fallback to URL analysis
    const url = item.page_url.toLowerCase();
    if (url === '/' || url.includes('/home') || url.includes('/index')) return 'Page d\'accueil';
    if (url.includes('/product') || url.includes('/item') || url.includes('/p/')) return 'Page produit';
    if (url.includes('/checkout') || url.includes('/cart') || url.includes('/payment')) return 'Checkout & Panier';
    if (url.includes('/category') || url.includes('/collection') || url.includes('/shop')) return 'Page catégorie';
    if (url.includes('/login') || url.includes('/signin') || url.includes('/auth')) return 'Page de connexion';
    if (url.includes('/signup') || url.includes('/register') || url.includes('/join')) return 'Page d\'inscription';
    if (url.includes('/pricing') || url.includes('/plans') || url.includes('/tarif')) return 'Page de prix';
    if (url.includes('/contact') || url.includes('/support') || url.includes('/aide')) return 'Page de contact';
    if (url.includes('/about') || url.includes('/company') || url.includes('/qui-sommes-nous')) return 'Page à propos';
    if (url.includes('/blog') || url.includes('/news') || url.includes('/article')) return 'Blog & Articles';
    if (url.includes('/search') || url.includes('/results') || url.includes('/recherche')) return 'Page de recherche';
    if (url.includes('/dashboard') || url.includes('/app') || url.includes('/admin')) return 'Dashboard & App';
    if (url.includes('/landing') || url.includes('/lp/')) return 'Landing page';
    return 'Autre page';
  };

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group suggestions by page type
    const groups = new Map<string, PageTypeGroup>();

    data.forEach((item) => {
      const pageType = determinePageType(item);
      
      if (!groups.has(pageType)) {
        groups.set(pageType, {
          pageType,
          suggestions: [],
          uniquePages: new Set(),
          totalSessions: 0
        });
      }

      const group = groups.get(pageType)!;
      group.uniquePages.add(item.page_url);
      group.totalSessions++;

      // Add all suggestions from this item
      if (item.suggestion_data?.suggestions) {
        item.suggestion_data.suggestions.forEach((suggestion: any) => {
          // Helper function to safely extract string values from objects
          const extractStringValue = (value: any, fallback: string = '') => {
            if (!value) return fallback;
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
              // Try common object keys
              return value.primary_metric || value.issue || value.description || value.content || fallback;
            }
            return String(value);
          };

          group.suggestions.push({
            id: suggestion.id || Math.random().toString(),
            title: suggestion.title || 'Untitled Suggestion',
            approach: suggestion.approach,
            problem_detected: extractStringValue(suggestion.problem_detected || suggestion.problem, 'Problème identifié'),
            solution_description: extractStringValue(suggestion.solution_description || suggestion.solution, 'Solution proposée'),
            expected_impact: extractStringValue(suggestion.expected_impact || suggestion.expectedImpact, 'Impact attendu'),
            psychology_insight: extractStringValue(suggestion.psychology_insight || suggestion.psychologyInsight, 'Insight psychologique'),
            difficulty: suggestion.difficulty || suggestion.code_complexity || 'medium',
            pageUrl: item.page_url,
            goalType: item.goal_type,
            createdAt: item.created_at,
            sessionId: item.session_id
          });
        });
      }
    });

    // Sort groups by number of suggestions (descending)
    return Array.from(groups.values()).sort((a, b) => b.suggestions.length - a.suggestions.length);
  }, [data]);

  const exportGroupedData = () => {
    const exportData = groupedData.map(group => ({
      pageType: group.pageType,
      totalSuggestions: group.suggestions.length,
      uniquePages: group.uniquePages.size,
      totalSessions: group.totalSessions,
      suggestions: group.suggestions.map(s => ({
        title: s.title,
        approach: s.approach,
        impact: s.expected_impact,
        difficulty: s.difficulty,
        pageUrl: s.pageUrl,
        goalType: s.goalType
      }))
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-suggestions-by-page-type-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Suggestions par Type de Page
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {groupedData.reduce((acc, group) => acc + group.suggestions.length, 0)} suggestions 
                regroupées par {groupedData.length} types de pages
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportGroupedData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <ABTestHistoryFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </CardHeader>

        <CardContent className="space-y-8">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(f => f) 
                  ? "Try adjusting your filters or search terms"
                  : "Generate your first AB test suggestions to see them here"
                }
              </p>
            </div>
          ) : (
            groupedData.map((group) => (
              <PageTypeSection key={group.pageType} group={group} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedSession && (
        <SuggestionDetailModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
};