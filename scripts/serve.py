"""Serve only application assets on localhost; development records stay private."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        candidate = (ROOT / path.lstrip("/")).resolve()
        if candidate == ROOT:
            candidate = ROOT / "index.html"
        try:
            relative = candidate.relative_to(ROOT).as_posix()
        except ValueError:
            relative = ""
        allowed = relative in ("index.html", "styles.css", "robots.txt", "sitemap.xml", "google68496077b7f7c978.html", "tests/browser.html", "tests/film.html", "tests/fixtures/landscape.jpg", "tests/fixtures/landscape-valley.jpg", "tests/fixtures/portrait-coast.jpg", "tests/fixtures/square-mountain.jpg", "tests/fixtures/panorama-trees.jpg", "tests/fixtures/tall-snow.jpg") or relative.startswith(("src/", "assets/"))
        if not allowed or not candidate.is_file():
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print("Frame It Up: http://127.0.0.1:4173", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 4173), Handler).serve_forever()
