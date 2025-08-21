import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreamingChatInterface } from "@/components/knowledge-vault/StreamingChatInterface";
import { Brain } from "lucide-react";

const InsightsVariantA = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          Posez des questions sur votre base de connaissances et obtenez des réponses intelligentes
        </p>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Assistant IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StreamingChatInterface />
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsVariantA;