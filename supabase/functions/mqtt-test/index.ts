import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MQTT_HOST = "k2f268df.ala.asia-southeast1.emqxsl.com";
    const MQTT_PORT = 8883;
    const MQTT_USERNAME = Deno.env.get('MQTT_USERNAME');
    const MQTT_PASSWORD = Deno.env.get('MQTT_PASSWORD');

    console.log("Testing MQTT connection to:", MQTT_HOST, "on port:", MQTT_PORT);
    console.log("Username configured:", !!MQTT_USERNAME);
    console.log("Password configured:", !!MQTT_PASSWORD);

    if (!MQTT_USERNAME || !MQTT_PASSWORD) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "MQTT credentials not configured",
          details: {
            host: MQTT_HOST,
            port: MQTT_PORT,
            hasUsername: !!MQTT_USERNAME,
            hasPassword: !!MQTT_PASSWORD
          }
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Test TCP connection to the MQTT broker
    // Deno doesn't have native MQTT client, but we can test TCP connectivity
    try {
      console.log("Attempting TLS connection...");
      const conn = await Deno.connectTls({
        hostname: MQTT_HOST,
        port: MQTT_PORT,
      });
      
      console.log("TLS connection established successfully!");
      
      // Close the connection
      conn.close();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully connected to MQTT broker (TLS handshake completed)",
          details: {
            host: MQTT_HOST,
            port: MQTT_PORT,
            protocol: "mqtts (TLS)",
            status: "Connection established and closed cleanly"
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (connError: unknown) {
      const errorMessage = connError instanceof Error ? connError.message : String(connError);
      const errorType = connError instanceof Error ? connError.name : "Unknown";
      console.error("Connection error:", errorMessage);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to connect to MQTT broker",
          details: {
            host: MQTT_HOST,
            port: MQTT_PORT,
            errorMessage: errorMessage,
            errorType: errorType
          }
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Unexpected error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
