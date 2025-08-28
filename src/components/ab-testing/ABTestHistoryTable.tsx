import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ABTestHistoryFilters } from "./ABTestHistoryFilters";
import { SuggestionDetailModal } from "./SuggestionDetailModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ChevronDown,
  ChevronRight,
  Target,
  Lightbulb
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

export const ABTestHistoryTable = ({
  data,
  isLoading,
  filters,
  onFiltersChange,
  onExport,
  onRefresh
}: ABTestHistoryTableProps) => {
  const [selectedSession, setSelectedSession] = useState<HistoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const getApproachIcon = (approach: string) => {
    switch (approach) {
      case 'Technical UX':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'Psychology':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Brand Differentiation':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getApproachCounts = (suggestions: any[]) => {
    const counts: Record<string, number> = { 'Technical UX': 0, 'Psychology': 0, 'Brand Differentiation': 0 };
    suggestions?.forEach(s => {
      if (counts.hasOwnProperty(s.approach)) {
        counts[s.approach]++;
      }
    });
    return counts;
  };

  const toggleRowExpansion = (sessionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const SuggestionRow = ({ suggestion, index }: { suggestion: any; index: number }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm leading-tight">
            {suggestion.title}
          </h4>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {getApproachIcon(suggestion.approach)}
            <span className="ml-1">{suggestion.approach}</span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
          {suggestion.description}
        </p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-orange-500" />
            <span className="text-muted-foreground">Impact:</span>
            <span className="font-medium">{suggestion.expected_impact}</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-yellow-500" />
            <span className="text-muted-foreground">Effort:</span>
            <span className="font-medium">{suggestion.implementation_effort}</span>
          </div>
        </div>
      </div>
    </div>
  );

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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Suggestions History ({data.length} sessions)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={onExport} variant="outline" size="sm">
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

        <CardContent className="p-0">
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
            <>
              <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Page URL</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Approaches</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item) => {
                        const suggestions = (item.suggestion_data as any)?.suggestions || [];
                        const counts = getApproachCounts(suggestions);
                        const isExpanded = expandedRows.has(item.session_id);
                        
                        return (
                          <React.Fragment key={item.id}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRowExpansion(item.session_id)}
                                  className="h-8 w-8 p-0"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </Button>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center gap-2 max-w-xs">
                                  <span className="truncate font-medium">
                                    {new URL(item.page_url).hostname}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.page_url, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {item.page_url}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <Badge variant="secondary">
                                  {item.goal_type}
                                </Badge>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex gap-1">
                                  {counts['Technical UX'] > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Zap className="w-3 h-3 mr-1 text-blue-500" />
                                      {counts['Technical UX']}
                                    </Badge>
                                  )}
                                  {counts['Psychology'] > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Brain className="w-3 h-3 mr-1 text-purple-500" />
                                      {counts['Psychology']}
                                    </Badge>
                                  )}
                                  {counts['Brand Differentiation'] > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                                      {counts['Brand Differentiation']}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {suggestions.length} suggestions
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="text-sm">
                                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSession(item)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                            
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={6} className="p-0">
                                  <div className="px-4 pb-4 animate-fade-in">
                                    <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-primary">
                                      <div className="flex items-center gap-2 mb-4">
                                        <Lightbulb className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold text-sm">
                                          AB Test Suggestions ({suggestions.length})
                                        </h3>
                                      </div>
                                      <div className="space-y-3">
                                        {suggestions.map((suggestion: any, index: number) => (
                                          <SuggestionRow 
                                            key={index} 
                                            suggestion={suggestion} 
                                            index={index} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} sessions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1 
                          : currentPage >= totalPages - 2 
                          ? totalPages - 4 + i 
                          : currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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