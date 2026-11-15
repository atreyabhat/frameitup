"""Create a static publish directory without development files."""
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[1]
output = root / "output" / "site"
if output.exists():
    shutil.rmtree(output)
output.mkdir(parents=True, exist_ok=True)
for name in ("index.html", "styles.css", "robots.txt", "sitemap.xml", "google68496077b7f7c978.html", "src", "assets"):
    source = root / name
    target = output / name
    if source.is_dir():
        shutil.copytree(source, target, dirs_exist_ok=True)
    else:
        shutil.copy2(source, target)
print(output)
