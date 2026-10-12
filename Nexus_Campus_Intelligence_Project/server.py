"""
Nova Genisis Campus Intelligence — Production Server Runner
Starts Uvicorn server hosting the FastAPI web application on port 8000.
"""

import os
import sys

# Force UTF-8 stdout on Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

import uvicorn

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    port = int(os.environ.get("PORT", 8000))

    print("=" * 70)
    print(">> Starting Nexus Campus Intelligence Platform...")
    print(f">> URL (Local):   http://127.0.0.1:{port}")
    print(f">> URL (Network): http://0.0.0.0:{port}")
    print(">> Roles Available:")
    print("   - Student Demo: student@campus.edu / student123")
    print("   - Faculty Demo: faculty@campus.edu / faculty123")
    print("   - Admin Demo:   admin@campus.edu / admin123")
    print("=" * 70)

    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=False, log_level="info")

