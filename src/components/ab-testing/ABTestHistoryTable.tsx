import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ABTestHistoryFilters } from "./ABTestHistoryFilters";
import { SuggestionDetailModal } from "./SuggestionDetailModal";
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
  TrendingUp
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
                      
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/50">
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
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
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