import subprocess
import os
import shutil

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

def run_migrations():
    print("Migrating DB...")
    subprocess.run([".venv\\Scripts\\flask.exe", "db", "upgrade"], cwd="backend", check=True)
    subprocess.run([".venv\\Scripts\\flask.exe", "db", "migrate", "-m", "Auto migration"], cwd="backend", check=True)
    print("DB migration done.")

if __name__ == "__main__":
    print("Running migrations")
    run_migrations()
    build_frontend()
    move_build()
    print("Frontend build moved to backend/static")
    print("Starting up")
    start_up()
    print("Succesfully started")