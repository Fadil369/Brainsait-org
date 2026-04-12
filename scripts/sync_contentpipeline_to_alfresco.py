#!/usr/bin/env python3
"""
Syncs local ContentPipeline output files to an Alfresco repository via the REST API.

Usage:
  python3 scripts/sync_contentpipeline_to_alfresco.py \
    --local-dir /Volumes/NetworkShare/ContentPipeline/published \
    --alfresco-url "http://localhost:8080/alfresco" \
    --user admin --password admin \
    --target-folder "documents"

  # Or with environment variables for credentials:
  export ALFRESCO_USER=admin
  export ALFRESCO_PASSWORD=admin
  python3 scripts/sync_contentpipeline_to_alfresco.py ...
"""

import argparse
import os
import sys
import mimetypes
from pathlib import Path
import requests
from requests.auth import HTTPBasicAuth

# Default Alfresco API base path
API_PATH = "/api/-default-/public/alfresco/versions/1"

def get_node_children(session, base_url, node_id="-my-", relative_path=None):
    """
    Finds a child node by relative path (e.g., "documents/ContentPipeline").
    Returns the node ID if found, or None.
    If relative_path is None or empty, returns the node_id itself.
    """
    if not relative_path:
        return node_id

    current_node_id = node_id
    parts = [p for p in relative_path.strip("/").split("/") if p]
    
    if not parts:
        return current_node_id

    for part in parts:
        # Search for child with name 'part'
        url = f"{base_url}{API_PATH}/nodes/{current_node_id}/children"
        params = {
            "where": f"(name='{part}')",
            "maxItems": 1
        }
        try:
            r = session.get(url, params=params)
            r.raise_for_status()
            data = r.json()
            entries = data.get("list", {}).get("entries", [])
            if not entries:
                return None
            current_node_id = entries[0]["entry"]["id"]
        except requests.exceptions.RequestException as e:
            print(f"Error finding folder '{part}': {e}", file=sys.stderr)
            return None

    return current_node_id

def ensure_folder_path(session, base_url, parent_node_id, relative_path):
    """
    Ensures a folder path exists, creating folders as needed.
    Returns the final folder node ID.
    """
    if not relative_path:
        return parent_node_id

    current_node_id = parent_node_id
    parts = [p for p in relative_path.strip("/").split("/") if p]
    
    if not parts:
        return current_node_id

    for part in parts:
        # Check if child exists
        url = f"{base_url}{API_PATH}/nodes/{current_node_id}/children"
        params = {"where": f"(name='{part}')", "maxItems": 1}
        
        found_id = None
        try:
            r = session.get(url, params=params)
            r.raise_for_status()
            entries = r.json().get("list", {}).get("entries", [])
            if entries:
                found_id = entries[0]["entry"]["id"]
        except requests.exceptions.RequestException:
            pass

        if found_id:
            current_node_id = found_id
        else:
            # Create folder
            print(f"Creating folder: {part} ...")
            payload = {
                "name": part,
                "nodeType": "cm:folder"
            }
            try:
                r = session.post(url, json=payload)
                r.raise_for_status()
                current_node_id = r.json()["entry"]["id"]
            except requests.exceptions.RequestException as e:
                print(f"Failed to create folder '{part}': {e}", file=sys.stderr)
                return None
    
    return current_node_id

def upload_file(session, base_url, parent_node_id, file_path):
    """
    Uploads a file to the specified parent node.
    Skips if a file with the same name already exists (unless --force is implemented, 
    but for now we'll just skip to be safe/fast).
    """
    file_path = Path(file_path)
    file_name = file_path.name

    # Check existence
    url = f"{base_url}{API_PATH}/nodes/{parent_node_id}/children"
    params = {"where": f"(name='{file_name}')", "maxItems": 1}
    
    try:
        r = session.get(url, params=params)
        r.raise_for_status()
        entries = r.json().get("list", {}).get("entries", [])
        if entries:
            print(f"Skipping {file_name} (already exists)")
            return True # Treated as success
    except requests.exceptions.RequestException as e:
        print(f"Error checking file existence for {file_name}: {e}", file=sys.stderr)
        return False

    # Upload
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    print(f"Uploading {file_name} ({mime_type})...")
    
    try:
        with open(file_path, 'rb') as f:
            files = {
                'filedata': (file_name, f, mime_type)
            }
            # 'autoRename': 'true' can be used to handle duplicates, but we checked above.
            r = session.post(url, files=files)
            r.raise_for_status()
            print(f"Successfully uploaded {file_name}")
            return True
    except requests.exceptions.RequestException as e:
        print(f"Failed to upload {file_name}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Upload files to Alfresco.")
    parser.add_argument("--local-dir", required=True, help="Local directory containing files to upload")
    parser.add_argument("--alfresco-url", required=True, help="Base URL of Alfresco (e.g., http://localhost:8080/alfresco)")
    parser.add_argument("--user", default=os.environ.get("ALFRESCO_USER"), help="Alfresco username")
    parser.add_argument("--password", default=os.environ.get("ALFRESCO_PASSWORD"), help="Alfresco password")
    parser.add_argument("--target-folder", default="documents", help="Target folder path relative to User Home (My Files)")
    
    args = parser.parse_args()

    if not args.user or not args.password:
        print("Error: Username and password are required (via arguments or env vars).", file=sys.stderr)
        sys.exit(1)

    local_path = Path(args.local_dir)
    if not local_path.is_dir():
        print(f"Error: Local directory '{args.local_dir}' does not exist.", file=sys.stderr)
        sys.exit(1)

    session = requests.Session()
    session.auth = HTTPBasicAuth(args.user, args.password)

    # 1. Resolve 'My Files' (-my-)
    # In standard Alfresco API, -my- alias resolves to the authenticated user's home folder.
    # We will use that as the root.
    user_home_id = "-my-" 

    # 2. Ensure target folder path exists
    # If the user passed "/user/documents", we'll strip leading slashes and treat it relative to Home.
    # e.g. "user/documents" -> ensure "user" exists, then "documents".
    # But usually "My Files" IS the user root. So if they want "documents" inside "My Files", 
    # we just look for "documents".
    
    # Heuristic: If path starts with /user/, strip it because -my- IS /user (effectively).
    rel_path = args.target_folder
    if rel_path.startswith("/user/"):
        rel_path = rel_path[6:]
    elif rel_path.startswith("/"):
        rel_path = rel_path[1:]
    
    print(f"Connecting to {args.alfresco_url}...")
    print(f"Targeting folder: -my-/{rel_path}")

    target_node_id = ensure_folder_path(session, args.alfresco_url, user_home_id, rel_path)
    if not target_node_id:
        print("Could not resolve or create target directory.", file=sys.stderr)
        sys.exit(1)

    # 3. Upload files
    success_count = 0
    fail_count = 0
    
    for item in local_path.iterdir():
        if item.is_file() and not item.name.startswith("."):
            if upload_file(session, args.alfresco_url, target_node_id, item):
                success_count += 1
            else:
                fail_count += 1

    print(f"\nUpload complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
