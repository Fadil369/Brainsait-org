#!/usr/bin/env python3
"""
Collect PDFs + videos from local folders and copy/move them into the
NetworkShare ContentPipeline `inbox/` for RAG processing.

Why this exists:
- ContentPipeline scripts scan only the *top-level* of `inbox/`
- Flattening can cause name collisions, so we prefix filenames with a short ID
- We write a hidden JSONL manifest in `inbox/` (ignored by the pipeline)

Examples:
  # Dry-run inventory (default sources: Desktop, Documents, Downloads, Movies)
  python3 scripts/collect_media_to_contentpipeline.py --dry-run

  # Copy everything under your home (skipping hidden dirs by default)
  python3 scripts/collect_media_to_contentpipeline.py --src ~ --mode copy

  # Move instead of copy, and also make backup copies for sync tools
  python3 scripts/collect_media_to_contentpipeline.py \
    --mode move \
    --extra-copy-dir "/path/to/TeraBoxSync" \
    --extra-copy-dir "/path/to/AlfrescoDrop"
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Iterator, Sequence


DEFAULT_DEST_INBOX = Path("/Volumes/NetworkShare/ContentPipeline/inbox")

DOCUMENT_EXTS = {".pdf"}
VIDEO_EXTS = {
    ".mp4",
    ".mov",
    ".m4v",
    ".avi",
    ".mkv",
    ".wmv",
    ".flv",
    ".webm",
    ".mpg",
    ".mpeg",
}

DEFAULT_EXCLUDE_DIR_NAMES = {
    # heavy/low-value for docs+videos collection
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "__pycache__",
    ".Trash",
    ".cache",
    ".npm",
    ".bun",
    ".yarn",
    ".pnpm-store",
    ".gradle",
    ".m2",
    ".cargo",
    ".rustup",
    "Library",  # macOS user Library can be huge and noisy
}


@dataclass(frozen=True)
class CandidateFile:
    src: Path
    size: int
    mtime: float
    kind: str  # "pdf" | "video"


def _now_compact() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _human_bytes(num: int) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if num < 1024:
            return f"{num:.1f} {unit}" if unit != "B" else f"{num} {unit}"
        num /= 1024
    return f"{num:.1f} PB"


def _safe_stat(path: Path) -> os.stat_result | None:
    try:
        return path.stat()
    except (FileNotFoundError, PermissionError, OSError):
        return None


def _candidate_kind(path: Path) -> str | None:
    ext = path.suffix.lower()
    if ext in DOCUMENT_EXTS:
        return "pdf"
    if ext in VIDEO_EXTS:
        return "video"
    return None


def _iter_candidates(
    sources: Sequence[Path],
    *,
    include_hidden: bool,
    exclude_dir_names: set[str],
    exclude_paths: Sequence[Path],
    max_files: int | None,
) -> Iterator[CandidateFile]:
    exclude_paths_resolved = []
    for p in exclude_paths:
        try:
            exclude_paths_resolved.append(p.expanduser().resolve())
        except Exception:
            exclude_paths_resolved.append(p.expanduser())

    def is_excluded_dir(dirname: str) -> bool:
        if dirname in exclude_dir_names:
            return True
        if not include_hidden and dirname.startswith("."):
            return True
        return False

    yielded = 0
    for src_root in sources:
        root = src_root.expanduser()
        if not root.exists():
            print(f"⚠️  Source not found: {root}", file=sys.stderr)
            continue

        for current_dir, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
            current_path = Path(current_dir)

            # Skip explicit excluded paths (and their children)
            try:
                current_resolved = current_path.resolve()
            except Exception:
                current_resolved = current_path

            if any(current_resolved == ep or ep in current_resolved.parents for ep in exclude_paths_resolved):
                dirnames[:] = []
                continue

            # Prune dir traversal
            dirnames[:] = [d for d in dirnames if not is_excluded_dir(d)]

            for name in filenames:
                if not include_hidden and name.startswith("."):
                    continue

                path = current_path / name
                kind = _candidate_kind(path)
                if not kind:
                    continue

                st = _safe_stat(path)
                if not st:
                    continue

                yield CandidateFile(src=path, size=int(st.st_size), mtime=float(st.st_mtime), kind=kind)
                yielded += 1
                if max_files is not None and yielded >= max_files:
                    return


def _short_id_for(path: Path, size: int, mtime: float) -> str:
    payload = f"{path}|{size}|{int(mtime)}".encode("utf-8", errors="ignore")
    return hashlib.sha1(payload).hexdigest()[:10]


def _unique_dest_path(dest_dir: Path, candidate: CandidateFile) -> Path:
    prefix = _short_id_for(candidate.src, candidate.size, candidate.mtime)
    base = f"{prefix}__{candidate.src.name}"
    dest = dest_dir / base
    if not dest.exists():
        return dest

    # Extremely unlikely; keep trying with a counter suffix.
    counter = 2
    while True:
        dest = dest_dir / f"{prefix}-{counter}__{candidate.src.name}"
        if not dest.exists():
            return dest
        counter += 1


def _copy_or_move(src: Path, dest: Path, *, mode: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if mode == "copy":
        shutil.copy2(src, dest)
    elif mode == "move":
        shutil.move(src, dest)
    else:
        raise ValueError(f"Unsupported mode: {mode}")


def _write_jsonl_line(fp, obj: dict) -> None:
    fp.write(json.dumps(obj, ensure_ascii=False) + "\n")
    fp.flush()


def run(args: argparse.Namespace) -> int:
    sources: list[Path]
    if args.src:
        sources = [Path(s) for s in args.src]
    else:
        sources = [
            Path("~/Desktop"),
            Path("~/Documents"),
            Path("~/Downloads"),
            Path("~/Movies"),
        ]

    dest_inbox = Path(args.dest_inbox).expanduser()

    # Prevent accidental recursion if the user includes NetworkShare as a source.
    exclude_paths: list[Path] = [dest_inbox, dest_inbox.parent]
    exclude_paths.extend(Path(p) for p in args.exclude_path or [])

    exclude_dir_names = set(DEFAULT_EXCLUDE_DIR_NAMES)
    if args.exclude_dir:
        exclude_dir_names.update(args.exclude_dir)

    extra_copy_dirs = [Path(p).expanduser() for p in (args.extra_copy_dir or [])]

    manifest_path = dest_inbox / f".bulk_import_{_now_compact()}.jsonl"
    mode = args.mode

    candidates = _iter_candidates(
        sources,
        include_hidden=args.include_hidden,
        exclude_dir_names=exclude_dir_names,
        exclude_paths=exclude_paths,
        max_files=args.max_files,
    )

    total_files = 0
    total_bytes = 0
    by_kind: dict[str, int] = {"pdf": 0, "video": 0}

    if args.dry_run:
        for c in candidates:
            total_files += 1
            total_bytes += c.size
            by_kind[c.kind] = by_kind.get(c.kind, 0) + 1

        print("Inventory (dry-run)")
        print(f"- Sources: {', '.join(str(s.expanduser()) for s in sources)}")
        print(f"- Found: {total_files} file(s) ({_human_bytes(total_bytes)})")
        print(f"- PDFs: {by_kind.get('pdf', 0)} | Videos: {by_kind.get('video', 0)}")
        print(f"- Destination inbox: {dest_inbox}")
        return 0

    # Basic destination validation
    if not dest_inbox.exists():
        print(f"❌ Destination inbox does not exist: {dest_inbox}", file=sys.stderr)
        print("   Mount NetworkShare and/or create the ContentPipeline first.", file=sys.stderr)
        return 2
    if not dest_inbox.is_dir():
        print(f"❌ Destination inbox is not a directory: {dest_inbox}", file=sys.stderr)
        return 2

    print("Collect + migrate")
    print(f"- Mode: {mode}")
    print(f"- Inbox: {dest_inbox}")
    if extra_copy_dirs:
        print(f"- Extra copies: {', '.join(str(p) for p in extra_copy_dirs)}")
    print(f"- Manifest: {manifest_path}")

    copied = 0
    skipped = 0
    failed = 0

    with open(manifest_path, "w", encoding="utf-8") as mf:
        for c in candidates:
            total_files += 1
            total_bytes += c.size
            by_kind[c.kind] = by_kind.get(c.kind, 0) + 1

            dest = _unique_dest_path(dest_inbox, c)

            entry = {
                "ts": datetime.now(timezone.utc).isoformat(),
                "kind": c.kind,
                "src": str(c.src),
                "dest_inbox": str(dest),
                "size_bytes": c.size,
                "mtime_epoch": c.mtime,
                "mode": mode,
                "status": "pending",
            }

            try:
                if dest.exists() and dest.stat().st_size == c.size:
                    entry["status"] = "skipped_exists"
                    skipped += 1
                    _write_jsonl_line(mf, entry)
                    continue

                _copy_or_move(c.src, dest, mode=mode)

                # Size verification (fast, no hashing)
                try:
                    if dest.stat().st_size != c.size:
                        raise RuntimeError("size_mismatch_after_copy")
                except Exception as e:
                    raise RuntimeError(f"verify_failed: {e}") from e

                # Optional additional copies (always copy)
                extra_results: list[dict] = []
                for extra_dir in extra_copy_dirs:
                    extra_dir.mkdir(parents=True, exist_ok=True)
                    extra_dest = extra_dir / dest.name
                    try:
                        shutil.copy2(dest, extra_dest)
                        extra_results.append({"dir": str(extra_dir), "dest": str(extra_dest), "status": "ok"})
                    except Exception as e:
                        extra_results.append({"dir": str(extra_dir), "dest": str(extra_dest), "status": "error", "error": str(e)})

                entry["extra_copies"] = extra_results
                entry["status"] = "ok"
                copied += 1
            except Exception as e:
                entry["status"] = "error"
                entry["error"] = str(e)
                failed += 1
            finally:
                _write_jsonl_line(mf, entry)

            if args.progress_every and (copied + skipped + failed) % args.progress_every == 0:
                print(f"  Progress: ok={copied} skipped={skipped} failed={failed} total={total_files}")

    print("Done")
    print(f"- Total found: {total_files} file(s) ({_human_bytes(total_bytes)})")
    print(f"- Copied: {copied} | Skipped: {skipped} | Failed: {failed}")
    print(f"- PDFs: {by_kind.get('pdf', 0)} | Videos: {by_kind.get('video', 0)}")
    print(f"- Manifest: {manifest_path}")
    return 0 if failed == 0 else 1


def main(argv: Sequence[str] | None = None) -> int:
    try:
        sys.stdout.reconfigure(line_buffering=True)
        sys.stderr.reconfigure(line_buffering=True)
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="Collect PDFs + videos into ContentPipeline inbox")
    parser.add_argument(
        "--src",
        action="append",
        help="Source directory to scan (repeatable). Defaults: ~/Desktop, ~/Documents, ~/Downloads, ~/Movies",
    )
    parser.add_argument(
        "--dest-inbox",
        default=str(DEFAULT_DEST_INBOX),
        help=f"ContentPipeline inbox directory (default: {DEFAULT_DEST_INBOX})",
    )
    parser.add_argument(
        "--mode",
        choices=["copy", "move"],
        default="copy",
        help="Copy (safe default) or move (removes originals)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only inventory matches; do not copy/move",
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="Include hidden files/dirs (names starting with '.')",
    )
    parser.add_argument(
        "--exclude-dir",
        action="append",
        help="Exclude directory name during scan (repeatable)",
    )
    parser.add_argument(
        "--exclude-path",
        action="append",
        help="Exclude a specific path (and its children) during scan (repeatable)",
    )
    parser.add_argument(
        "--extra-copy-dir",
        action="append",
        help="After inbox copy/move, also copy into this directory (repeatable; useful for TeraBox/Alfresco drop folders)",
    )
    parser.add_argument(
        "--max-files",
        type=int,
        default=None,
        help="Stop after N matches (useful for batching/testing)",
    )
    parser.add_argument(
        "--progress-every",
        type=int,
        default=50,
        help="Print progress every N processed files (0 disables)",
    )
    args = parser.parse_args(argv)

    if args.progress_every is not None and args.progress_every <= 0:
        args.progress_every = 0

    return run(args)


if __name__ == "__main__":
    raise SystemExit(main())
