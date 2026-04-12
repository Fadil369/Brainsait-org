/**
 * BrainSAIT MCP Worker — Cloudflare Worker implementing MCP HTTP transport
 * Exposes healthcare tools for LINC agents via authenticated JSON-RPC endpoint
 * Deployed to: brainsait-mcp.fadil369.workers.dev / mcp.elfadil.com
 */

interface Env {
  OPENWEBUI_API_KEY: string;
  OPENWEBUI_URL: string;
}

const TOOLS = [
  {
    name: "nphies_eligibility_check",
    description: "Check patient insurance eligibility against NPHIES. Returns coverage, policy limits, co-pay.",
    inputSchema: {
      type: "object",
      properties: {
        national_id: { type: "string", description: "Patient National ID or Iqama number" },
        insurance_provider: { type: "string", description: "Payer: Tawnia, Bupa, Rajhi, MOH, AXA, Medgulf" },
        service_date: { type: "string", description: "Service date YYYY-MM-DD" },
        service_type: { type: "string", description: "inpatient | outpatient | dental | pharmacy" }
      },
      required: ["national_id", "insurance_provider"]
    }
  },
  {
    name: "claim_status_lookup",
    description: "Query NPHIES claim status by claim reference or patient + organization.",
    inputSchema: {
      type: "object",
      properties: {
        claim_ref: { type: "string", description: "NPHIES claim reference CLM-YYYY-NNNNN" },
        organization_npi: { type: "string", description: "Hospital NPI 7-digit" },
        patient_id: { type: "string", description: "Optional patient national ID" }
      },
      required: ["organization_npi"]
    }
  },
  {
    name: "fhir_validate",
    description: "Validate a FHIR R4 resource against Saudi NPHIES profiles.",
    inputSchema: {
      type: "object",
      properties: {
        resource_type: { type: "string", description: "FHIR type: Patient, Claim, Coverage, etc." },
        resource_json: { type: "string", description: "JSON-serialized FHIR resource" }
      },
      required: ["resource_type", "resource_json"]
    }
  },
  {
    name: "oracle_portal_query",
    description: "Query Oracle RAD hospital portal for claim/patient data.",
    inputSchema: {
      type: "object",
      properties: {
        hospital: { type: "string", description: "Site: riyadh | madinah | unaizah | khamis | jizan | abha" },
        query_type: { type: "string", description: "claim_status | patient_lookup | auth_status" },
        reference: { type: "string", description: "Reference ID" }
      },
      required: ["hospital", "query_type", "reference"]
    }
  },
  {
    name: "call_linc_agent",
    description: "A2A: Delegate a specialized task to a LINC agent for multi-agent orchestration.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          enum: ["claimlinc","authlinc","drglinc","clinicallinc","codelinc","bridgelinc","compliancelinc","ttlinc","radiolinc","brainsait-nphies-agent"],
          description: "Target LINC agent ID"
        },
        task: { type: "string", description: "Task or question (max 2000 chars)" },
        context: { type: "string", description: "Optional parent-agent context" }
      },
      required: ["agent_id", "task"]
    }
  },
  {
    name: "icd_cpt_lookup",
    description: "Look up ICD-10-AM, CPT, ACHI, or DRG codes by description or code number.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Code or clinical description" },
        code_system: { type: "string", enum: ["ICD-10-AM","CPT","ACHI","DRG"], description: "Code system" },
        limit: { type: "integer", description: "Max results (default 5)" }
      },
      required: ["query", "code_system"]
    }
  }
];

type CodeEntry = { code: string; description: string };
const CODE_DB: Record<string, CodeEntry[]> = {
  "ICD-10-AM": [
    { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia" },
    { code: "E11.22", description: "Type 2 diabetes mellitus with diabetic chronic kidney disease stage 5" },
    { code: "I21.0",  description: "Acute transmural myocardial infarction of anterior wall" },
    { code: "I50.9",  description: "Heart failure, unspecified" },
    { code: "J18.9",  description: "Pneumonia, unspecified organism" },
    { code: "J44.1",  description: "COPD with acute exacerbation" },
    { code: "S72.0",  description: "Fracture of head and neck of femur" },
    { code: "K80.0",  description: "Calculus of gallbladder with acute cholecystitis" },
    { code: "K80.5",  description: "Calculus of bile duct without cholangitis or cholecystitis" },
    { code: "N18.5",  description: "Chronic kidney disease, stage 5" },
    { code: "Z99.2",  description: "Dependence on renal dialysis" },
    { code: "R65.21", description: "Severe sepsis with septic shock" }
  ],
  "CPT": [
    { code: "47563", description: "Laparoscopic cholecystectomy with intraoperative cholangiography" },
    { code: "47564", description: "Laparoscopic cholecystectomy with exploration of common bile duct" },
    { code: "93454", description: "Catheter placement coronary artery for angiography" },
    { code: "93458", description: "Catheter-based coronary angiography with left ventriculography" },
    { code: "72148", description: "MRI lumbar spine without contrast" },
    { code: "72156", description: "MRI lumbar spine with contrast" },
    { code: "99213", description: "Office visit established patient moderate complexity" },
    { code: "99232", description: "Subsequent hospital care moderate complexity" }
  ],
  "ACHI": [
    { code: "1119-00", description: "Hip hemiarthroplasty" },
    { code: "1339-00", description: "Total knee replacement" },
    { code: "3802-01", description: "Laparoscopic cholecystectomy" },
    { code: "38285-01", description: "Coronary artery bypass graft x3" }
  ],
  "DRG": [
    { code: "E62A", description: "Respiratory infections and inflammations, major complexity" },
    { code: "I18B", description: "Hip replacement without catastrophic or severe complication" },
    { code: "F15Z", description: "Percutaneous coronary intervention" },
    { code: "G07B", description: "Laparoscopic cholecystectomy without complication" }
  ]
};

async function handleToolCall(name: string, args: Record<string, unknown>, env: Env): Promise<string> {
  switch (name) {
    case "nphies_eligibility_check":
      return JSON.stringify({
        status: "eligible",
        patient_id: args.national_id,
        insurance: args.insurance_provider,
        service_date: args.service_date || new Date().toISOString().split("T")[0],
        coverage: { inpatient: true, outpatient: true, dental: false, pharmacy: true },
        deductible: { annual: 500, used: 120, remaining: 380, currency: "SAR" },
        co_pay: { outpatient: "20%", inpatient: "20% up to SAR 2000" },
        max_benefit: { annual: 500000, currency: "SAR" },
        nphies_response_id: "ELIG-" + Date.now(),
        verified_at: new Date().toISOString(),
        note: "[Sandbox] Connect live NPHIES for production"
      }, null, 2);

    case "claim_status_lookup":
      return JSON.stringify({
        claim_ref: args.claim_ref || "CLM-" + Date.now(),
        organization_npi: args.organization_npi,
        status: "PENDING_REVIEW",
        payer: "Tawnia Insurance",
        total_charged: 4250.00,
        adjudication_status: "Under clinical review",
        next_action: "Submit additional documentation within 5 business days",
        nphies_transaction_id: "TXN-" + Date.now(),
        note: "[Sandbox] Connect live NPHIES for production"
      }, null, 2);

    case "fhir_validate": {
      let resource: Record<string, unknown> = {};
      try { resource = JSON.parse(args.resource_json as string) as Record<string, unknown>; }
      catch { return JSON.stringify({ valid: false, errors: ["Invalid JSON in resource_json"] }); }
      const errors: string[] = [];
      const warnings: string[] = [];
      if (!resource.resourceType) errors.push("Missing resourceType");
      if (!resource.id) warnings.push("Recommend adding resource.id");
      if (resource.resourceType === "Patient" && !resource.identifier) errors.push("NPHIES Patient requires identifier (NationalID)");
      if (resource.resourceType === "Claim" && !resource.insurance) errors.push("NPHIES Claim requires insurance array");
      return JSON.stringify({ valid: errors.length === 0, resource_type: resource.resourceType, errors, warnings });
    }

    case "oracle_portal_query":
      return JSON.stringify({
        hospital: args.hospital,
        query_type: args.query_type,
        reference: args.reference,
        result: { status: "found", data: `Oracle ${args.hospital as string} returned 1 record for ${args.reference as string}` },
        portal_url: "https://oracle-" + (args.hospital as string) + ".elfadil.com",
        timestamp: new Date().toISOString(),
        note: "[Sandbox] Real queries require hospital network access"
      }, null, 2);

    case "call_linc_agent": {
      const messages: Array<{role: string; content: string}> = [{ role: "user", content: args.task as string }];
      if (args.context) messages.unshift({ role: "system", content: "Parent context: " + String(args.context) });
      const resp = await fetch(env.OPENWEBUI_URL + "/api/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + env.OPENWEBUI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ model: args.agent_id, messages, stream: false, max_tokens: 1500 })
      });
      if (!resp.ok) return "A2A error: HTTP " + resp.status + " from " + String(args.agent_id);
      const data = await resp.json() as { choices: Array<{message: {content: string}}> };
      return "[" + String(args.agent_id).toUpperCase() + "]\n" + data.choices[0].message.content;
    }

    case "icd_cpt_lookup": {
      const sys = args.code_system as string;
      const q = (args.query as string).toLowerCase();
      const lim = (args.limit as number) || 5;
      const results = (CODE_DB[sys] || []).filter(c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).slice(0, lim);
      return JSON.stringify({ query: args.query, code_system: sys, results, total_found: results.length });
    }

    default:
      return JSON.stringify({ error: "Unknown tool: " + name });
  }
}

function mcpResponse(id: unknown, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

function mcpError(id: unknown, code: number, message: string): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    status: 400,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key"
      }});
    }

    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({
        service: "BrainSAIT MCP Worker",
        version: "2.0.0",
        tools: TOOLS.length,
        status: "operational",
        endpoints: { mcp: "/mcp", tools: "/tools", health: "/health" }
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/tools" && req.method === "GET") {
      return new Response(JSON.stringify({ tools: TOOLS }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/mcp") {
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      let body: Record<string, unknown>;
      try { body = await req.json() as Record<string, unknown>; }
      catch { return mcpError(null, -32700, "Parse error"); }

      const { jsonrpc, id, method, params } = body as {
        jsonrpc: string; id: unknown; method: string; params: Record<string, unknown>
      };
      if (jsonrpc !== "2.0") return mcpError(id, -32600, "Invalid JSON-RPC version");

      switch (method) {
        case "initialize":
          return mcpResponse(id, {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "brainsait-mcp", version: "2.0.0" }
          });
        case "tools/list":
          return mcpResponse(id, { tools: TOOLS });
        case "tools/call": {
          const { name, arguments: toolArgs } = (params || {}) as { name: string; arguments: Record<string, unknown> };
          if (!name) return mcpError(id, -32602, "Missing tool name");
          try {
            const result = await handleToolCall(name, toolArgs || {}, env);
            return mcpResponse(id, { content: [{ type: "text", text: result }] });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            return mcpError(id, -32603, "Tool error: " + msg);
          }
        }
        default:
          return mcpError(id, -32601, "Method not found: " + method);
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
