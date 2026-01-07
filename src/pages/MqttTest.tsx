import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: {
    host?: string;
    port?: number;
    protocol?: string;
    status?: string;
    errorMessage?: string;
    errorType?: string;
    hasUsername?: boolean;
    hasPassword?: boolean;
  };
}

const MqttTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('mqtt-test');
      
      if (error) {
        setResult({
          success: false,
          error: error.message,
        });
      } else {
        setResult(data as TestResult);
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              MQTT Broker Connection Test
            </CardTitle>
            <CardDescription>
              Test connectivity to the MQTT broker before implementing full functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <p><span className="text-muted-foreground">Host:</span> k2f268df.ala.asia-southeast1.emqxsl.com</p>
              <p><span className="text-muted-foreground">Port:</span> 8883 (TLS/SSL)</p>
              <p><span className="text-muted-foreground">Protocol:</span> MQTTS</p>
            </div>

            <Button 
              onClick={testConnection} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {result && (
              <Card className={result.success ? "border-green-500" : "border-destructive"}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    {result.success ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                          Success
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <Badge variant="destructive">Failed</Badge>
                      </>
                    )}
                  </div>

                  <p className="text-sm mb-3">
                    {result.message || result.error}
                  </p>

                  {result.details && (
                    <div className="bg-muted rounded-lg p-3 text-xs font-mono space-y-1">
                      {Object.entries(result.details).map(([key, value]) => (
                        <p key={key}>
                          <span className="text-muted-foreground">{key}:</span>{" "}
                          {typeof value === "boolean" ? (value ? "✓" : "✗") : String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MqttTest;
