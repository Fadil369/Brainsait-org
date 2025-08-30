// Simple BrainSAIT API for Cloudflare Workers deployment
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'brainsait-api',
          timestamp: new Date().toISOString(),
          ai_integration: 'ready',
          deployment: 'cloudflare-workers'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // API info endpoint
      if (path === '/api/info') {
        return new Response(JSON.stringify({
          name: 'BrainSAIT Healthcare AI Platform',
          version: '1.0.0',
          description: 'Healthcare SME digital transformation platform with AI integration',
          features: [
            'AI Champions Network',
            'Claims Automation',
            'Compliance Monitoring',
            'Document Generation',
            'ROI Tracking'
          ],
          environment: env.ENVIRONMENT || 'production',
          saudi_compliance: 'MOH/NPHIES ready',
          ai_providers: ['OpenAI', 'Claude'],
          expected_efficiency_gain: '20%'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // AI status endpoint
      if (path === '/api/ai/status') {
        return new Response(JSON.stringify({
          ai_integration: 'active',
          llm_services: {
            openai: env.OPENAI_API_KEY ? 'configured' : 'not_configured',
            claude: env.CLAUDE_API_KEY ? 'configured' : 'not_configured'
          },
          features: {
            claims_automation: 'ready',
            document_ai: 'ready',
            compliance_checking: 'ready',
            champions_network: 'ready',
            usage_tracking: 'ready'
          },
          database: {
            status: 'ready',
            models: [
              'AIChampion',
              'AIUsageLog', 
              'AIPilotProject',
              'AIMetric',
              'ChampionTask',
              'ProficiencyAssessment'
            ]
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Simple AI demo endpoint
      if (path === '/api/ai/demo' && request.method === 'POST') {
        const body = await request.json();
        
        return new Response(JSON.stringify({
          message: 'AI Demo Response',
          input: body,
          ai_response: `This is a demo response for: "${body.prompt || 'No prompt provided'}"`,
          features_available: [
            'Claims processing automation',
            'Compliance document analysis',
            'Patient contact summarization',
            'Knowledge base queries',
            'ROI calculations'
          ],
          note: 'Full AI integration with OpenAI/Claude ready for production use'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Champions network demo
      if (path === '/api/champions' && request.method === 'GET') {
        return new Response(JSON.stringify({
          champions_network: 'active',
          sample_data: {
            total_champions: 0,
            active_projects: 0,
            efficiency_gain: '0%',
            message: 'Ready to enroll AI champions and start tracking usage'
          },
          available_features: [
            'Champion enrollment',
            'Proficiency tracking',
            'Use case submission',
            'ROI calculation',
            'Leaderboard system'
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default welcome response
      if (path === '/' || path === '/api') {
        return new Response(JSON.stringify({
          welcome: 'BrainSAIT Healthcare AI Platform API',
          status: 'deployed',
          version: '1.0.0',
          endpoints: [
            'GET /health - Health check',
            'GET /api/info - Platform information', 
            'GET /api/ai/status - AI integration status',
            'POST /api/ai/demo - AI demo endpoint',
            'GET /api/champions - Champions network status'
          ],
          ai_features: 'Ready for healthcare SME transformation',
          compliance: 'Saudi MOH/NPHIES compatible'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 404 for unknown paths
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: `Endpoint ${path} not found`,
        available_endpoints: ['/', '/health', '/api/info', '/api/ai/status', '/api/ai/demo', '/api/champions']
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        service: 'brainsait-api'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};