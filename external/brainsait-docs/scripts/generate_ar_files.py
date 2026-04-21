#!/usr/bin/env python3
"""
Generate Arabic (.ar.md) placeholder files for all English markdown files.

This script scans the docs directory for English markdown files and creates
corresponding Arabic placeholder files with RTL support.

Usage:
    python scripts/generate_ar_files.py
    python scripts/generate_ar_files.py --dry-run
    python scripts/generate_ar_files.py --directory docs/healthcare
"""

from __future__ import annotations

import argparse
import logging
import os
import re
import sys
from pathlib import Path
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def parse_frontmatter(content: str) -> tuple[Optional[str], str]:
    """
    Parse YAML frontmatter from markdown content.

    Args:
        content: The full markdown content

    Returns:
        Tuple of (frontmatter string or None, body content)
    """
    frontmatter_match = re.match(r"^---\n(.*?)\n---\n(.*)", content, re.DOTALL)
    if frontmatter_match:
        return frontmatter_match.group(1), frontmatter_match.group(2)
    return None, content


def create_arabic_placeholder(
    frontmatter: Optional[str],
    body: str,
) -> str:
    """
    Create Arabic placeholder content with RTL support.

    Args:
        frontmatter: The YAML frontmatter string (if any)
        body: The markdown body content

    Returns:
        The generated Arabic placeholder content
    """
    translation_notice = '''!!! info "Translation in Progress | الترجمة قيد الإجراء"
    This content is currently being translated. | هذا المحتوى قيد الترجمة حالياً.

'''

    rtl_wrapper_start = '<div dir="rtl" lang="ar">\n\n'
    rtl_wrapper_end = "\n\n</div>"

    if frontmatter:
        return (
            f"---\n{frontmatter}\n---\n\n"
            f"{translation_notice}"
            f"{rtl_wrapper_start}"
            f"{body}"
            f"{rtl_wrapper_end}"
        )
    else:
        return (
            f"{translation_notice}"
            f"{rtl_wrapper_start}"
            f"{body}"
            f"{rtl_wrapper_end}"
        )


def generate_ar_file(
    file_path: Path,
    dry_run: bool = False,
) -> bool:
    """
    Generate an Arabic placeholder file for a given English markdown file.

    Args:
        file_path: Path to the English markdown file
        dry_run: If True, only log what would be done without creating files

    Returns:
        True if file was created (or would be in dry-run), False if skipped
    """
    ar_filename = file_path.stem + ".ar.md"
    ar_file_path = file_path.parent / ar_filename

    # Skip if Arabic file already exists
    if ar_file_path.exists():
        logger.debug(f"Skipping {ar_file_path} (already exists)")
        return False

    if dry_run:
        logger.info(f"[DRY RUN] Would create: {ar_file_path}")
        return True

    try:
        content = file_path.read_text(encoding="utf-8")
        frontmatter, body = parse_frontmatter(content)
        ar_content = create_arabic_placeholder(frontmatter, body)

        ar_file_path.write_text(ar_content, encoding="utf-8")
        logger.info(f"Created: {ar_file_path}")
        return True

    except Exception as e:
        logger.error(f"Failed to process {file_path}: {e}")
        return False


def generate_ar_files(
    root_dir: str | Path,
    dry_run: bool = False,
) -> tuple[int, int, int]:
    """
    Generate Arabic placeholder files for all English markdown files.

    Args:
        root_dir: Root directory to scan
        dry_run: If True, only log what would be done

    Returns:
        Tuple of (files_created, files_skipped, files_failed)
    """
    root_path = Path(root_dir)

    if not root_path.exists():
        logger.error(f"Directory does not exist: {root_dir}")
        return 0, 0, 0

    created = 0
    skipped = 0
    failed = 0

    for md_file in root_path.rglob("*.md"):
        # Skip Arabic files
        if md_file.name.endswith(".ar.md"):
            continue

        # Skip files in hidden directories
        if any(part.startswith(".") for part in md_file.parts):
            continue

        result = generate_ar_file(md_file, dry_run)
        if result:
            created += 1
        else:
            # Check if it was skipped or failed
            ar_path = md_file.parent / (md_file.stem + ".ar.md")
            if ar_path.exists():
                skipped += 1
            else:
                failed += 1

    return created, skipped, failed


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate Arabic placeholder files for documentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "-d",
        "--directory",
        default="docs",
        help="Root directory to scan (default: docs)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without creating files",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose output",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info(f"Scanning directory: {args.directory}")
    if args.dry_run:
        logger.info("Running in dry-run mode")

    created, skipped, failed = generate_ar_files(args.directory, args.dry_run)

    logger.info(f"Summary: {created} created, {skipped} skipped, {failed} failed")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
