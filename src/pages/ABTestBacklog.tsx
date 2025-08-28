import React, { useState, useEffect } from 'react';
import { Archive, Filter, Target, Plus, Calendar, User, Tag, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { CreateTicketModal } from '@/components/ab-testing/CreateTicketModal';

interface BacklogItem {
  id: string;
  suggestion_id: string;
  original_suggestion_data: any;
  priority: string;
  tags: string[];
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ABTestBacklog = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBacklogItems = async () => {
    if (!user || !currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('ab_test_backlog')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBacklogItems(data || []);
    } catch (error) {
      console.error('Error fetching backlog items:', error);
      toast({
        title: "Error",
        description: "Failed to load backlog items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('ab_test_backlog')
        .update({ status: 'archived' })
        .eq('id', itemId);

      if (error) throw error;

      setBacklogItems(items => items.filter(item => item.id !== itemId));
      toast({
        title: "Item Archived",
        description: "Backlog item has been archived successfully",
      });
    } catch (error) {
      console.error('Error archiving item:', error);
      toast({
        title: "Error",
        description: "Failed to archive item",
        variant: "destructive",
      });
    }
  };

  const handleCreateFromBacklog = (item: BacklogItem) => {
    setSelectedItem(item);
    setIsCreateModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredItems = backlogItems.filter(item => {
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    const matchesTag = !filterTag || item.tags.some(tag => 
      tag.toLowerCase().includes(filterTag.toLowerCase())
    );
    const matchesSearch = !searchQuery || 
      item.original_suggestion_data?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesTag && matchesSearch;
  });

  const allTags = Array.from(new Set(backlogItems.flatMap(item => item.tags)));

  useEffect(() => {
    fetchBacklogItems();
  }, [user, currentWorkspace]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            📋 AB Test Backlog
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved AB test ideas and suggestions for future development
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          />

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Archive className="w-4 h-4" />
            {filteredItems.length} items
          </div>
        </div>

        {/* Backlog Items */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No backlog items found</h3>
              <p className="text-muted-foreground">
                {backlogItems.length === 0 
                  ? "Start by adding suggestions to your backlog from the AB Test Generator"
                  : "Try adjusting your filters to see more items"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const suggestion = item.original_suggestion_data;
              return (
                <Card key={item.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{suggestion?.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Approach:</span> {suggestion?.approach}
                      </div>
                      <div>
                        <span className="font-medium">Expected Impact:</span> {suggestion?.expected_impact}
                      </div>
                      {suggestion?.difficulty && (
                        <div>
                          <span className="font-medium">Difficulty:</span> {suggestion.difficulty}
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      </div>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>

                    <Button
                      onClick={() => handleCreateFromBacklog(item)}
                      className="w-full"
                      size="sm"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Create AB Test
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Ticket Modal */}
        {selectedItem && (
          <CreateTicketModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedItem(null);
            }}
            suggestion={selectedItem.original_suggestion_data}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ABTestBacklog;