#!/usr/bin/env python3
"""
PDF to Markdown Converter for Obsidian
محول PDF إلى Markdown للاستخدام في Obsidian

Usage:
    python3 pdf_to_markdown.py file.pdf
    python3 pdf_to_markdown.py *.pdf
    python3 pdf_to_markdown.py --dir /path/to/pdfs
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
from datetime import datetime


class PDFToMarkdownConverter:
    def __init__(self, obsidian_vault_path=None):
        """
        Initialize converter
        
        Args:
            obsidian_vault_path: Path to Obsidian vault (optional)
        """
        self.obsidian_vault_path = obsidian_vault_path
        self.check_dependencies()
    
    def check_dependencies(self):
        """Check if required tools are installed"""
        try:
            result = subprocess.run(
                ['which', 'pdftotext'],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                print("❌ Poppler not installed")
                print("📦 Installing Poppler...")
                subprocess.run(['brew', 'install', 'poppler'], check=True)
                print("✅ Poppler installed successfully")
        except Exception as e:
            print(f"❌ Error checking dependencies: {e}")
            sys.exit(1)
    
    def convert_pdf(self, pdf_path: Path, output_dir: Path = None) -> Path:
        """
        Convert PDF to Markdown
        
        Args:
            pdf_path: Path to PDF file
            output_dir: Output directory (defaults to PDF location)
            
        Returns:
            Path to created Markdown file
        """
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        
        # Determine output path
        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            md_path = output_dir / f"{pdf_path.stem}.md"
        else:
            md_path = pdf_path.with_suffix('.md')
        
        print(f"📄 Converting: {pdf_path.name}")
        
        # Convert PDF to text with layout preservation
        try:
            subprocess.run(
                ['pdftotext', '-layout', str(pdf_path), str(md_path)],
                check=True
            )
        except subprocess.CalledProcessError as e:
            raise Exception(f"Conversion failed: {e}")
        
        # Add Obsidian metadata
        self.add_obsidian_metadata(md_path, pdf_path)
        
        print(f"✅ Created: {md_path.name}")
        print(f"📊 Size: {self.format_size(md_path.stat().st_size)}")
        
        return md_path
    
    def add_obsidian_metadata(self, md_path: Path, pdf_path: Path):
        """Add Obsidian YAML frontmatter to markdown file"""
        # Read current content
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create metadata header
        metadata = f"""---
title: {pdf_path.stem}
date: {datetime.now().strftime('%Y-%m-%d')}
source: {pdf_path.name}
type: pdf-conversion
tags: [pdf, imported, medical-notes]
---

# {pdf_path.stem}

> 📄 Converted from: `{pdf_path.name}`
> 📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

"""
        
        # Write with metadata
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(metadata + content)
    
    def format_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"
    
    def convert_directory(self, dir_path: Path, recursive: bool = False):
        """
        Convert all PDFs in directory
        
        Args:
            dir_path: Directory containing PDFs
            recursive: Also search subdirectories
        """
        pattern = '**/*.pdf' if recursive else '*.pdf'
        pdf_files = list(dir_path.glob(pattern))
        
        if not pdf_files:
            print(f"⚠️  No PDF files found in {dir_path}")
            return
        
        print(f"🔄 Found {len(pdf_files)} PDF file(s)")
        print("================================")
        
        successful = 0
        failed = 0
        
        for pdf_path in pdf_files:
            try:
                self.convert_pdf(pdf_path)
                successful += 1
                print()
            except Exception as e:
                print(f"❌ Failed: {pdf_path.name} - {e}")
                failed += 1
                print()
        
        print("================================")
        print(f"✅ Successfully converted: {successful}")
        if failed > 0:
            print(f"❌ Failed: {failed}")
    
    def copy_to_obsidian(self, md_path: Path):
        """Copy markdown file to Obsidian vault"""
        if not self.obsidian_vault_path:
            print("⚠️  Obsidian vault path not set")
            return
        
        vault = Path(self.obsidian_vault_path)
        if not vault.exists():
            print(f"❌ Vault not found: {vault}")
            return
        
        # Create 'Imported PDFs' folder in vault
        target_dir = vault / 'Imported PDFs'
        target_dir.mkdir(exist_ok=True)
        
        target_path = target_dir / md_path.name
        
        # Copy file
        import shutil
        shutil.copy2(md_path, target_path)
        
        print(f"📋 Copied to Obsidian: {target_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Convert PDF to Markdown for Obsidian',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ECG_Notes.pdf
  %(prog)s *.pdf
  %(prog)s --dir ~/Documents/PDFs
  %(prog)s file.pdf --obsidian ~/ObsidianVault
        """
    )
    
    parser.add_argument(
        'files',
        nargs='*',
        help='PDF file(s) to convert'
    )
    
    parser.add_argument(
        '--dir',
        type=Path,
        help='Convert all PDFs in directory'
    )
    
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Search subdirectories (with --dir)'
    )
    
    parser.add_argument(
        '--obsidian',
        type=Path,
        help='Path to Obsidian vault (auto-copy converted files)'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=Path,
        help='Output directory for markdown files'
    )
    
    args = parser.parse_args()
    
    # Print header
    print("================================")
    print("  PDF to Markdown Converter")
    print("  محول PDF إلى Markdown")
    print("================================\n")
    
    # Initialize converter
    converter = PDFToMarkdownConverter(obsidian_vault_path=args.obsidian)
    
    # Convert files
    if args.dir:
        # Directory mode
        converter.convert_directory(args.dir, recursive=args.recursive)
    elif args.files:
        # File mode
        for file_path in args.files:
            pdf_path = Path(file_path)
            try:
                md_path = converter.convert_pdf(pdf_path, output_dir=args.output)
                
                # Copy to Obsidian if requested
                if args.obsidian:
                    converter.copy_to_obsidian(md_path)
                
                print()
            except Exception as e:
                print(f"❌ Error: {e}\n")
    else:
        # Interactive mode
        print("📂 No files specified. Enter PDF path:")
        pdf_path = input("> ").strip()
        
        if pdf_path:
            try:
                converter.convert_pdf(Path(pdf_path))
            except Exception as e:
                print(f"❌ Error: {e}")
        else:
            parser.print_help()
    
    print("✅ Done!")
    print("\n💡 Tip: Import the .md files into your Obsidian vault")


if __name__ == "__main__":
    main()
