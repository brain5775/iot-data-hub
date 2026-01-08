import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, topic } = await req.json();

    const mqttBroker = "k2f268df.ala.asia-southeast1.emqxsl.com";
    const mqttPort = 8883;
    const username = Deno.env.get("MQTT_USERNAME");
    const password = Deno.env.get("MQTT_PASSWORD");

    if (!username || !password) {
      throw new Error("MQTT credentials not configured");
    }

    // Return connection info for WebSocket client
    // The actual MQTT connection will be handled client-side via WebSocket
    return new Response(
      JSON.stringify({
        success: true,
        config: {
          broker: `wss://${mqttBroker}:8084/mqtt`,
          username,
          password,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("MQTT function error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
