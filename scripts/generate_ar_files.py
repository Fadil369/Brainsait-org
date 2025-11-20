import os
import re

def generate_ar_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.md') and not filename.endswith('.ar.md'):
                file_path = os.path.join(dirpath, filename)
                ar_filename = filename.replace('.md', '.ar.md')
                ar_file_path = os.path.join(dirpath, ar_filename)
                
                if os.path.exists(ar_file_path):
                    print(f"Skipping {ar_file_path} (already exists)")
                    continue
                
                print(f"Generating {ar_file_path}...")
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Simple frontmatter parsing
                frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
                
                if frontmatter_match:
                    frontmatter = frontmatter_match.group(1)
                    body = frontmatter_match.group(2)
                    
                    # Add or update title in frontmatter if possible (naive approach)
                    # We won't translate automatically here to avoid errors, but we'll keep the structure
                    
                    new_content = f"---\n{frontmatter}\n---\n\n"
                    new_content += '!!! info "Translation in Progress / الترجمة قيد الإجراء"\n'
                    new_content += '    This content is currently being translated. / هذا المحتوى قيد الترجمة حالياً.\n\n'
                    new_content += '<div dir="rtl">\n\n'
                    new_content += body # Copy English content for reference
                    new_content += '\n\n</div>'
                else:
                    # No frontmatter
                    new_content = '!!! info "Translation in Progress / الترجمة قيد الإجراء"\n'
                    new_content += '    This content is currently being translated. / هذا المحتوى قيد الترجمة حالياً.\n\n'
                    new_content += '<div dir="rtl">\n\n'
                    new_content += content
                    new_content += '\n\n</div>'
                
                with open(ar_file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

if __name__ == "__main__":
    generate_ar_files("docs")
