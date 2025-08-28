import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ABTestHistoryTable } from "@/components/ab-testing/ABTestHistoryTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Filter, Search, Calendar } from 'lucide-react';

interface HistoryItem {
  id: string;
  session_id: string;
  goal_type: string;
  page_url: string;
  created_at: string;
  suggestion_data: any; // Using any to handle Json type from Supabase
}

const ABTestHistory = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    goalType: '',
    dateFrom: '',
    dateTo: '',
    approach: '',
    pageUrl: ''
  });

  const fetchHistory = async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('ab_test_suggestions_history')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.goalType) {
        query = query.eq('goal_type', filters.goalType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.pageUrl) {
        query = query.ilike('page_url', `%${filters.pageUrl}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Additional client-side filtering for complex searches
      let filteredData = data || [];
      
      if (filters.search) {
        filteredData = filteredData.filter(item => {
          const suggestions = (item.suggestion_data as any)?.suggestions || [];
          return suggestions.some((suggestion: any) =>
            suggestion.title?.toLowerCase().includes(filters.search.toLowerCase())
          );
        });
      }

      if (filters.approach) {
        filteredData = filteredData.filter(item => {
          const suggestions = (item.suggestion_data as any)?.suggestions || [];
          return suggestions.some((suggestion: any) =>
            suggestion.approach === filters.approach
          );
        });
      }

      setHistoryData(filteredData);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error loading history",
        description: "Unable to load AB test suggestions history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentWorkspace?.id, filters]);

  const handleExportHistory = () => {
    const exportData = historyData.map(item => ({
      session_id: item.session_id,
      page_url: item.page_url,
      goal_type: item.goal_type,
      created_at: item.created_at,
      suggestions_count: (item.suggestion_data as any)?.suggestions?.length || 0,
      suggestions: (item.suggestion_data as any)?.suggestions || []
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "History exported",
      description: `Exported ${exportData.length} history items`
    });
  };

  const statsData = React.useMemo(() => {
    const total = historyData.length;
    const lastWeek = historyData.filter(item => 
      new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const goalTypes = historyData.reduce((acc, item) => {
      acc[item.goal_type] = (acc[item.goal_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonGoal = Object.entries(goalTypes)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      total,
      lastWeek,
      mostCommonGoal: mostCommonGoal?.[0] || 'None',
      totalSuggestions: historyData.reduce((acc, item) => 
        acc + ((item.suggestion_data as any)?.suggestions?.length || 0), 0
      )
    };
  }, [historyData]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AB Test History
            </h1>
          </div>
          <p className="text-muted-foreground">
            Browse and analyze your previous AB test suggestions (last 3 months)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{statsData.lastWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statsData.totalSuggestions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-purple-600">{statsData.mostCommonGoal}</div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <ABTestHistoryTable
          data={historyData}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExportHistory}
          onRefresh={fetchHistory}
        />
      </div>
    </DashboardLayout>
  );
};

export default ABTestHistory;