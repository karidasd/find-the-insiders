import os
import sys
import subprocess
import time
import webbrowser
import http.server
import socketserver
import threading

def run_backend():
    print("Starting FastAPI backend on port 8000...")
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    
    # Run uvicorn server in backend folder
    subprocess.run([
        sys.executable, "-m", "uvicorn", "main:app", 
        "--host", "127.0.0.1", "--port", "8000"
    ], cwd=backend_dir)

def run_frontend():
    print("Starting frontend server on port 3000...")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=frontend_dir, **kwargs)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", 3000), Handler) as httpd:
        print("Frontend served at http://localhost:3000")
        httpd.serve_forever()

if __name__ == "__main__":
    # Start Backend in thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Give backend a moment to boot
    time.sleep(2)
    
    # Start Frontend in thread
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()
    
    time.sleep(1)
    
    # Open browser automatically
    print("\n" + "="*50)
    print("SOLANA INSIDER DETECTOR IS ONLINE")
    print("Opening dashboard at: http://localhost:3000")
    print("="*50 + "\n")
    
    webbrowser.open("http://localhost:3000")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers. Goodbye!")
