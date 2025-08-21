import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ABTestErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for debugging
    console.error('AB Test Error Boundary caught an error:', error, errorInfo);

    // Show toast notification
    toast({
      title: "Une erreur est survenue",
      description: "Le composant AB Test a rencontré un problème",
      variant: "destructive",
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Erreur du générateur AB Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2">
                  Une erreur inattendue s'est produite. Vous pouvez :
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Réessayer l'opération</li>
                  <li>Revenir à l'étape précédente</li>
                  <li>Recharger la page si le problème persiste</li>
                </ul>
              </div>

              {this.state.error && (
                <details className="bg-muted/30 p-3 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Détails de l'erreur (cliquez pour afficher)
                  </summary>
                  <div className="mt-2 text-xs text-muted-foreground font-mono">
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    <p><strong>Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                {this.props.onBack && (
                  <Button
                    onClick={this.props.onBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ABTestErrorBoundary;