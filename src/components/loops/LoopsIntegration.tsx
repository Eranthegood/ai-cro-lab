import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoops } from '@/hooks/useLoops';
import { Loader2, Mail, Users, Send } from 'lucide-react';
import WaitlistSyncToLoops from './WaitlistSyncToLoops';

export const LoopsIntegration = () => {
  const {
    isLoading,
    error,
    createContact,
    sendTransactionalEmail,
    getLists,
    addToList,
  } = useLoops();

  const [contactForm, setContactForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    source: 'dashboard',
  });

  const [emailForm, setEmailForm] = useState({
    transactionalId: '',
    email: '',
    dataVariables: '{}',
  });

  const [lists, setLists] = useState<any[]>([]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        ...contactForm,
        subscribed: true,
      });
      setContactForm({ email: '', firstName: '', lastName: '', source: 'dashboard' });
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dataVariables = {};
      if (emailForm.dataVariables.trim()) {
        dataVariables = JSON.parse(emailForm.dataVariables);
      }

      await sendTransactionalEmail({
        transactionalId: emailForm.transactionalId,
        email: emailForm.email,
        dataVariables,
      });
      setEmailForm({ transactionalId: '', email: '', dataVariables: '{}' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  };

  const handleGetLists = async () => {
    try {
      const result = await getLists();
      setLists(result || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Intégration Loops
          </CardTitle>
          <CardDescription>
            Gérez vos contacts et emails avec l'API Loops
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="lists">Listes</TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sync Waitlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un contact</CardTitle>
              <CardDescription>
                Créez un nouveau contact dans votre base Loops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={contactForm.source}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, source: e.target.value })
                      }
                      placeholder="dashboard"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={contactForm.firstName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, firstName: e.target.value })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={contactForm.lastName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, lastName: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Créer le contact
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Envoyer un email transactionnel</CardTitle>
              <CardDescription>
                Envoyez un email basé sur un template Loops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="transactionalId">ID du template transactionnel *</Label>
                  <Input
                    id="transactionalId"
                    required
                    value={emailForm.transactionalId}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, transactionalId: e.target.value })
                    }
                    placeholder="clkv7i1in000008jy4zwt5t4m"
                  />
                </div>

                <div>
                  <Label htmlFor="emailRecipient">Email du destinataire *</Label>
                  <Input
                    id="emailRecipient"
                    type="email"
                    required
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, email: e.target.value })
                    }
                    placeholder="recipient@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="dataVariables">Variables de données (JSON)</Label>
                  <Textarea
                    id="dataVariables"
                    value={emailForm.dataVariables}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, dataVariables: e.target.value })
                    }
                    placeholder='{"firstName": "John", "companyName": "ACME Inc"}'
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Envoyer l'email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <Card>
            <CardHeader>
              <CardTitle>Listes de diffusion</CardTitle>
              <CardDescription>
                Gérez vos listes de diffusion Loops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleGetLists} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Charger les listes
                </Button>

                {lists.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Listes disponibles:</h3>
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className="p-3 border rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{list.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {list.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <WaitlistSyncToLoops />
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erreur: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};