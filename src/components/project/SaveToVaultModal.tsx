import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjects } from '@/hooks/useProjects';

interface SaveToVaultModalProps {
  content: string;
  messageContext?: any;
  children?: React.ReactNode;
}

export const SaveToVaultModal = ({ content, messageContext, children }: SaveToVaultModalProps) => {
  const { currentProject, saveResponseToVault } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToVault = async () => {
    if (!documentName.trim() || !currentProject) return;

    setIsSaving(true);
    const { error } = await saveResponseToVault(
      currentProject.id,
      documentName.trim(),
      content,
      messageContext
    );

    if (!error) {
      setIsOpen(false);
      setDocumentName('');
    }
    setIsSaving(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveToVault();
    }
  };

  if (!currentProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Archive className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Vault</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a name for this document..."
              className="mt-1"
              autoFocus
            />
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="text-sm max-h-32 overflow-y-auto">
              {content.length > 200 ? `${content.substring(0, 200)}...` : content}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveToVault}
              disabled={!documentName.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save to Vault"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};