#!/bin/bash
# PDF to Markdown Converter for Obsidian
# تحويل PDF إلى Markdown للاستخدام في Obsidian

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  PDF to Markdown Converter${NC}"
echo -e "${GREEN}  محول PDF إلى Markdown${NC}"
echo -e "${GREEN}================================${NC}"

# Check if Poppler is installed
if ! command -v pdftotext &> /dev/null; then
    echo -e "${RED}❌ Poppler not installed${NC}"
    echo -e "${YELLOW}📦 Installing Poppler...${NC}"
    brew install poppler
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Poppler${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Poppler installed successfully${NC}"
fi

# Function to convert PDF to Markdown
convert_pdf() {
    local pdf_file="$1"
    local output_file="${pdf_file%.pdf}.md"
    
    if [ ! -f "$pdf_file" ]; then
        echo -e "${RED}❌ File not found: $pdf_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}📄 Converting: $pdf_file${NC}"
    
    # Convert with layout preservation
    pdftotext -layout "$pdf_file" "$output_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Converted to: $output_file${NC}"
        
        # Add metadata header
        local title=$(basename "$pdf_file" .pdf)
        local date=$(date +"%Y-%m-%d")
        
        # Create temporary file with header
        cat > "${output_file}.tmp" << EOF
---
title: $title
date: $date
source: PDF
tags: [pdf, imported]
---

# $title

EOF
        
        # Append converted content
        cat "$output_file" >> "${output_file}.tmp"
        mv "${output_file}.tmp" "$output_file"
        
        echo -e "${GREEN}📝 Added Obsidian metadata${NC}"
        echo -e "${GREEN}📊 File size: $(wc -c < "$output_file" | numfmt --to=iec-i --suffix=B)${NC}"
        
        return 0
    else
        echo -e "${RED}❌ Conversion failed${NC}"
        return 1
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    # Interactive mode
    echo -e "${YELLOW}📂 Select PDF file(s) to convert:${NC}"
    echo "   1. Convert single PDF"
    echo "   2. Convert all PDFs in current directory"
    echo "   3. Convert PDFs in specific directory"
    echo ""
    read -p "Choice (1-3): " choice
    
    case $choice in
        1)
            read -p "Enter PDF filename: " pdf_file
            convert_pdf "$pdf_file"
            ;;
        2)
            echo -e "${YELLOW}🔄 Converting all PDFs in current directory...${NC}"
            count=0
            for pdf in *.pdf; do
                if [ -f "$pdf" ]; then
                    convert_pdf "$pdf"
                    ((count++))
                fi
            done
            echo -e "${GREEN}✅ Converted $count PDF(s)${NC}"
            ;;
        3)
            read -p "Enter directory path: " dir_path
            if [ -d "$dir_path" ]; then
                echo -e "${YELLOW}🔄 Converting all PDFs in $dir_path...${NC}"
                count=0
                for pdf in "$dir_path"/*.pdf; do
                    if [ -f "$pdf" ]; then
                        convert_pdf "$pdf"
                        ((count++))
                    fi
                done
                echo -e "${GREEN}✅ Converted $count PDF(s)${NC}"
            else
                echo -e "${RED}❌ Directory not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    # Command line mode
    for pdf_file in "$@"; do
        convert_pdf "$pdf_file"
    done
fi

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Conversion complete!${NC}"
echo -e "${YELLOW}💡 Tip: Copy the .md files to your Obsidian vault${NC}"
echo -e "${GREEN}================================${NC}"
