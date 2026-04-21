#!/usr/bin/env python3
"""
BrainSAIT GitHub Models Proxy
Listens on :8888, proxies to https://models.github.ai/inference
Adds /v1/models endpoint (GitHub Models doesn't expose one at root)
"""
import os, json, threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import urllib.parse

UPSTREAM = "https://models.github.ai/inference"
TOKEN = os.environ.get("GITHUB_MODELS_TOKEN", "")

# Static model catalog — what we expose as available
MODELS = [
    {"id": "gpt-4o",               "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "gpt-4o-mini",          "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "gpt-4.1",              "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "gpt-4.1-mini",         "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "gpt-5",                "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "o4-mini",              "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "o3",                   "object": "model", "owned_by": "github", "publisher": "openai"},
    {"id": "Meta-Llama-4-Scout",   "object": "model", "owned_by": "github", "publisher": "meta"},
    {"id": "Meta-Llama-3.3-70B-Instruct", "object": "model", "owned_by": "github", "publisher": "meta"},
    {"id": "DeepSeek-V3-0324",     "object": "model", "owned_by": "github", "publisher": "deepseek"},
    {"id": "DeepSeek-R1",          "object": "model", "owned_by": "github", "publisher": "deepseek"},
    {"id": "Mistral-Large-2411",   "object": "model", "owned_by": "github", "publisher": "mistralai"},
    {"id": "Mistral-small-2503",   "object": "model", "owned_by": "github", "publisher": "mistralai"},
    {"id": "grok-3",               "object": "model", "owned_by": "github", "publisher": "xai"},
    {"id": "grok-3-mini",          "object": "model", "owned_by": "github", "publisher": "xai"},
]

class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress access logs

    def _models_response(self):
        body = json.dumps({"object": "list", "data": MODELS}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/v1/models", "/models"):
            self._models_response()
            return
        self._proxy("GET", b"")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""
        self._proxy("POST", body)

    def _proxy(self, method, body):
        path = self.path
        # Normalize: /chat/completions → /v1/chat/completions
        if not path.startswith("/v1/"):
            path = "/v1" + path
        url = UPSTREAM + path

        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": self.headers.get("Content-Type", "application/json"),
            "Accept": self.headers.get("Accept", "*/*"),
        }

        try:
            req = Request(url, data=body or None, headers=headers, method=method)
            with urlopen(req, timeout=120) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                ct = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
        except HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)
        except Exception as e:
            msg = json.dumps({"error": str(e)}).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8888), ProxyHandler)
    print(f"GitHub Models proxy running on :8888 → {UPSTREAM}", flush=True)
    server.serve_forever()
