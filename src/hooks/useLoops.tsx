import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoopsContact {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  subscribed?: boolean;
  userGroup?: string;
  userId?: string;
}

interface LoopsTransactionalEmail {
  transactionalId: string;
  email: string;
  dataVariables?: Record<string, any>;
}

export const useLoops = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callLoopsApi = async (action: string, data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke(
        'loops-integration',
        {
          body: { action, ...data },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Une erreur est survenue avec Loops';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContact = async (contactData: LoopsContact) => {
    const result = await callLoopsApi('createContact', contactData);
    toast.success('Contact ajouté à Loops');
    return result;
  };

  const updateContact = async (email: string, updateData: Partial<LoopsContact>) => {
    const result = await callLoopsApi('updateContact', { email, ...updateData });
    toast.success('Contact mis à jour dans Loops');
    return result;
  };

  const deleteContact = async (email: string) => {
    const result = await callLoopsApi('deleteContact', { email });
    toast.success('Contact supprimé de Loops');
    return result;
  };

  const getContact = async (email: string) => {
    return await callLoopsApi('getContact', { email });
  };

  const sendTransactionalEmail = async (emailData: LoopsTransactionalEmail) => {
    const result = await callLoopsApi('sendTransactionalEmail', emailData);
    toast.success('Email transactionnel envoyé');
    return result;
  };

  const addToList = async (email: string, listId: string) => {
    const result = await callLoopsApi('addToList', { email, listId });
    toast.success('Contact ajouté à la liste');
    return result;
  };

  const removeFromList = async (email: string, listId: string) => {
    const result = await callLoopsApi('removeFromList', { email, listId });
    toast.success('Contact retiré de la liste');
    return result;
  };

  const getLists = async () => {
    return await callLoopsApi('getLists', {});
  };

  return {
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    sendTransactionalEmail,
    addToList,
    removeFromList,
    getLists,
  };
};