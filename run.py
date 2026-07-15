"""
run.py — one-click launcher for Hassan Ahmed's portfolio site.

HOW TO USE IN PYCHARM:
1. Open this project folder in PyCharm.
2. Right-click run.py -> "Run 'run.py'"  (or just press the green ▶ button
   at the top of the editor while this file is open).
3. PyCharm's console will print a link like:
       http://localhost:8000
   Your default browser will also open automatically.
4. To stop the server, click the red ■ stop button in PyCharm
   (or press Ctrl+C in the terminal).

No installs needed — this only uses Python's built-in standard library,
so it works with any Python 3 interpreter PyCharm gives you.
"""

import http.server
import socketserver
import webbrowser
import threading
import sys
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent.resolve()


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    """Serves the portfolio files (index.html, style.css, script.js)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def log_message(self, format, *args):
        # Keep the PyCharm console clean — only show real requests.
        print(f"  → {args[0]}")


def find_open_port(start_port: int) -> int:
    """If the preferred port is busy, try the next few ports instead."""
    for port in range(start_port, start_port + 10):
        try:
            with socketserver.TCPServer(("", port), PortfolioHandler):
                return port
        except OSError:
            continue
    raise RuntimeError("No open port found between "
                        f"{start_port} and {start_port + 9}.")


def main():
    port = find_open_port(PORT)
    url = f"http://localhost:{port}"

    with socketserver.TCPServer(("", port), PortfolioHandler) as httpd:
        print("=" * 52)
        print("  Hassan Ahmed — Portfolio Server")
        print("=" * 52)
        print(f"  Serving files from: {DIRECTORY}")
        print(f"  Your site is live at:")
        print(f"      {url}")
        print("=" * 52)
        print("  Press Ctrl+C (or the PyCharm stop button) to quit.\n")

        # Open the browser automatically, slightly delayed so the
        # server is guaranteed to be ready to accept the connection.
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped. Bye! 👋")
            sys.exit(0)


if __name__ == "__main__":
    main()
