from pathlib import Path
p=Path('src/html.ts')
s=p.read_text()
s=s.replace('    let nodeIndex = -1\n', '')
s=s.replace('        nodeIndex++\n', '')
p.write_text(s)
