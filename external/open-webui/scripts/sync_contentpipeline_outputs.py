#!/usr/bin/env python3
"""
Sync processed ContentPipeline outputs to one or more local target folders.

Typical use:
- After ContentPipeline processes items (outputs/published/transcripts/etc.)
- Copy those results into:
  - a TeraBox desktop sync folder (so it uploads automatically)
  - a local "Alfresco drop" folder that is mounted into your Alfresco container

Examples:
  # Dry-run what would be copied from published/ into two targets
  python3 scripts/sync_contentpipeline_outputs.py \
    --subdir published \
    --target "/path/to/TeraBoxSync/ContentPipeline" \
    --target "/path/to/AlfrescoDrop/ContentPipeline" \
    --dry-run

  # Copy published/ + output/ (skips unchanged files by default)
  python3 scripts/sync_contentpipeline_outputs.py \
    --subdir published --subdir output \
    --target "/path/to/TeraBoxSync/ContentPipeline" \
    --target "/path/to/AlfrescoDrop/ContentPipeline"
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator, Sequence


DEFAULT_PIPELINE_ROOT = Path("/Volumes/NetworkShare/ContentPipeline")


@dataclass(frozen=True)
class FileItem:
    src: Path
    rel: Path
    size: int
    mtime: float


def _now_compact() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _human_bytes(num: int) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if num < 1024:
            return f"{num:.1f} {unit}" if unit != "B" else f"{num} {unit}"
        num /= 1024
    return f"{num:.1f} PB"


def _write_jsonl(fp, obj: dict) -> None:
    fp.write(json.dumps(obj, ensure_ascii=False) + "\n")
    fp.flush()


def _iter_files(root: Path) -> Iterator[FileItem]:
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        current = Path(dirpath)
        for name in filenames:
            if name.startswith("."):
                continue
            p = current / name
            try:
                st = p.stat()
            except (FileNotFoundError, PermissionError, OSError):
                continue
            yield FileItem(src=p, rel=p.relative_to(root), size=int(st.st_size), mtime=float(st.st_mtime))


def run(args: argparse.Namespace) -> int:
    pipeline_root = Path(args.pipeline_root).expanduser()
    if not pipeline_root.exists():
        print(f"❌ Pipeline root not found: {pipeline_root}", file=sys.stderr)
        return 2

    subdirs = args.subdir or ["published"]
    targets = [Path(t).expanduser() for t in (args.target or [])]
    if not targets:
        print("❌ At least one --target is required", file=sys.stderr)
        return 2

    sources: list[tuple[str, Path]] = []
    for sd in subdirs:
        src_dir = pipeline_root / sd
        if not src_dir.exists() or not src_dir.is_dir():
            print(f"⚠️  Skip missing source: {src_dir}", file=sys.stderr)
            continue
        sources.append((sd, src_dir))

    if not sources:
        print("❌ No valid source subdirectories found", file=sys.stderr)
        return 2

    manifest_name = f".sync_manifest_{_now_compact()}.jsonl"

    total_files = 0
    total_bytes = 0
    copied = 0
    skipped = 0
    failed = 0

    if args.dry_run:
        for sd, src_dir in sources:
            for item in _iter_files(src_dir):
                total_files += 1
                total_bytes += item.size
        print("Sync plan (dry-run)")
        print(f"- Pipeline root: {pipeline_root}")
        print(f"- Sources: {', '.join(sd for sd, _ in sources)}")
        print(f"- Targets: {', '.join(str(t) for t in targets)}")
        print(f"- Would copy: {total_files} file(s) ({_human_bytes(total_bytes)})")
        return 0

    for target in targets:
        target.mkdir(parents=True, exist_ok=True)

    manifest_paths = [t / manifest_name for t in targets]
    manifest_files = [open(mp, "w", encoding="utf-8") for mp in manifest_paths]
    try:
        print("Sync outputs")
        print(f"- Pipeline root: {pipeline_root}")
        print(f"- Sources: {', '.join(sd for sd, _ in sources)}")
        print(f"- Targets: {', '.join(str(t) for t in targets)}")

        for sd, src_dir in sources:
            for item in _iter_files(src_dir):
                total_files += 1
                total_bytes += item.size

                for target, mf in zip(targets, manifest_files, strict=True):
                    dest = target / sd / item.rel
                    entry = {
                        "ts": datetime.now(timezone.utc).isoformat(),
                        "source_subdir": sd,
                        "src": str(item.src),
                        "dest": str(dest),
                        "size_bytes": item.size,
                        "mtime_epoch": item.mtime,
                        "status": "pending",
                    }
                    try:
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        if dest.exists() and dest.stat().st_size == item.size:
                            entry["status"] = "skipped_exists"
                            skipped += 1
                            _write_jsonl(mf, entry)
                            continue
                        shutil.copy2(item.src, dest)
                        if dest.stat().st_size != item.size:
                            raise RuntimeError("size_mismatch_after_copy")
                        entry["status"] = "ok"
                        copied += 1
                    except Exception as e:
                        entry["status"] = "error"
                        entry["error"] = str(e)
                        failed += 1
                    finally:
                        _write_jsonl(mf, entry)

                if args.progress_every and total_files % args.progress_every == 0:
                    print(f"  Progress: copied={copied} skipped={skipped} failed={failed} scanned={total_files}")

        print("Done")
        print(f"- Scanned: {total_files} file(s) ({_human_bytes(total_bytes)})")
        print(f"- Copied: {copied} | Skipped: {skipped} | Failed: {failed}")
        print(f"- Manifest(s): {', '.join(str(p) for p in manifest_paths)}")
        return 0 if failed == 0 else 1
    finally:
        for f in manifest_files:
            f.close()


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Sync ContentPipeline outputs to local targets")
    parser.add_argument(
        "--pipeline-root",
        default=str(DEFAULT_PIPELINE_ROOT),
        help=f"ContentPipeline root (default: {DEFAULT_PIPELINE_ROOT})",
    )
    parser.add_argument(
        "--subdir",
        action="append",
        help="Pipeline subdirectory to sync (repeatable). Default: published",
    )
    parser.add_argument(
        "--target",
        action="append",
        help="Target directory to copy into (repeatable)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only compute what would be synced",
    )
    parser.add_argument(
        "--progress-every",
        type=int,
        default=200,
        help="Print progress every N scanned files (0 disables)",
    )
    args = parser.parse_args(argv)
    if args.progress_every is not None and args.progress_every <= 0:
        args.progress_every = 0
    return run(args)


if __name__ == "__main__":
    raise SystemExit(main())

