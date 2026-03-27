import urllib.request
import os
import re

# EVERYTHING IS RAW STRINGS
base_dir = r"d:/RodrigoPuertas/scripts/project_my_profile_site/public"

if not os.path.exists(base_dir):
    os.makedirs(base_dir)

urls = {
    'index.html': r'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzhjMjY5ZjBmNjhiZjQ3YjhhOWNhNzMxNzViZmVmYmZmEgsSBxC_oILJsgwYAZIBIwoKcHJvamVjdF9pZBIVQhM5MjcwNTY5ODYwOTIwNDQ4NDA2&filename=&opi=96797242',
    'projects.html': r'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzhjMTRjM2VhNDFlMzQwMGU5NGNhNTM1ZmMyNGRkYTBkEgsSBxC_oILJsgwYAZIBIwoKcHJvamVjdF9pZBIVQhM5MjcwNTY5ODYwOTIwNDQ4NDA2&filename=&opi=96797242',
    'consult.html': r'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFlZGU5NDY4YmJlODQzM2FiZmFjYjk1ZDJiNDVhYWVjEgsSBxC_oILJsgwYAZIBIwoKcHJvamVjdF9pZBIVQhM5MjcwNTY5ODYwOTIwNDQ4NDA2&filename=&opi=96797242'
}

cursor_css = r"""
        body { cursor: none; }
        a, button { cursor: none; }
        #cursor-dot { position: fixed; top: 0; left: 0; width: 6px; height: 6px; background: #fff; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.4s ease; mix-blend-mode: difference; }
        #cursor-ring { position: fixed; top: 0; left: 0; width: 40px; height: 40px; border: 1px solid rgba(167, 165, 255, 0.7); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.4s ease, width 0.35s cubic-bezier(.23,1,.32,1), height 0.35s cubic-bezier(.23,1,.32,1); }
        #cursor-glow { position: fixed; top: 0; left: 0; width: 350px; height: 350px; background: radial-gradient(circle, rgba(167, 165, 255, 0.06) 0%, transparent 65%); border-radius: 50%; pointer-events: none; z-index: 9997; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.4s ease; }
        body.cursor-active #cursor-dot, body.cursor-active #cursor-ring, body.cursor-active #cursor-glow { opacity: 1; }
        body.cursor-hover #cursor-dot { width: 10px; height: 10px; }
        body.cursor-hover #cursor-ring { width: 64px; height: 64px; border-color: rgba(140, 231, 255, 0.5); }
"""
cursor_html = r"""
    <div id='cursor-dot'></div>
    <div id='cursor-ring'></div>
    <div id='cursor-glow'></div>
"""
mobile_menu_html = r"""
    <div id='mobile-menu' class='fixed inset-0 bg-surface/95 backdrop-blur-xl z-[100] translate-x-full transition-transform duration-500 flex flex-col items-center justify-center gap-8'>
        <button id='close-menu' class='absolute top-8 right-8 text-on-surface'><span class='material-symbols-outlined text-4xl'>close</span></button>
        <nav class='flex flex-col items-center gap-8 text-2xl font-headline font-bold uppercase tracking-widest'>
            <a href='index.html' class='hover:text-primary transition-colors'>Overview</a>
            <a href='projects.html' class='hover:text-primary transition-colors'>Projects</a>
            <a href='consult.html' class='hover:text-primary transition-colors'>Consult</a>
        </nav>
    </div>
"""

for filename, url in urls.items():
    file_path = os.path.join(base_dir, filename)
    print(f"Downloading {filename}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
    
    # 1. Inject CSS and cursor elements
    if '</style>' in content:
        content = content.replace('</style>', cursor_css + '\n    </style>')
    
    if '</body>' in content:
        content = content.replace('</body>', cursor_html + mobile_menu_html + '\n    <script src="js/main.js"></script>\n</body>')
    
    # 2. Update Navbar Links for consistency
    content = content.replace('href="#"', 'href="index.html"')
    content = re.sub(r'href="[^"]*?(projects\.html|consult\.html|index\.html)[^"]*?"', lambda m: f'href="{os.path.basename(m.group(0).strip(chr(34)))}"', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patching complete.")
