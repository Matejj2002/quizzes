import subprocess
import os
import shutil
import sys

def build_frontend():
    print("Building frontend...")
    subprocess.run(["C:\\Program Files\\nodejs\\npm.cmd   ", "run", "build"], cwd="frontend", check=True)

def move_build():
    print("Moving build to backend/static...")
    src = os.path.join("frontend", "build")
    dest = os.path.join("backend", "static")

    if os.path.exists(dest):
        shutil.rmtree(dest)

    shutil.move(src, dest)

def start_up():
    subprocess.run([".venv\\Scripts\\python.exe", "backend\\app.py "])

if __name__ == "__main__":
    print("Running migrations")
    build_frontend()
    move_build()
    print("Frontend build moved to backend/static")
    print("Starting up")
    start_up()
    print("Succesfully started")