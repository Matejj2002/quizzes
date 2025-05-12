from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from functions.api_functions import *
from flask_session import Session
import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
import subprocess
from pathlib import Path
from routes.questions import questions_bp
from routes.auth import auth_bp
from routes.users import users_bp
from routes.categories import categories_bp
from routes.quiz_template import quiz_template_bp
from routes.quiz_statistics import quiz_statistics_bp
from routes.quiz import quiz_bp

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
app.register_blueprint(questions_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(quiz_template_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(quiz_statistics_bp)

migrate = Migrate(app, db)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False

DB_PORT = os.getenv('DB_PORT')
APP_BASENAME = os.getenv("APP_BASENAME")

if os.environ.get("IS_DOCKER") == 'true':
    DB_HOST = os.getenv('DB_HOST')

else:
    DB_HOST = "localhost"

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@"+DB_HOST+":"+DB_PORT+"/quizzes"

app.config['SQLALCHEMY_ECHO'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = not app.debug
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

db.init_app(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if "quizzes/" in path:
        path = path.split("quizzes/")[1]

    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def check_database_exists():
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')

    conn = psycopg2.connect(
        dbname="postgres", user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    conn.autocommit = True
    cursor = conn.cursor()

    cursor.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [DB_NAME])
    exists = cursor.fetchone()

    if exists:
        print(f"Database '{DB_NAME}' already existing")

        try:
            pass
            # print("Migrating DB...")
            # os.environ["FLASK_APP"] = "backend/app.py"
            # subprocess.run([".venv\\Scripts\\flask.exe", "db", "upgrade"], cwd="backend", check=True)
            # subprocess.run([".venv\\Scripts\\flask.exe", "db", "migrate", "-m", "Auto migration"], cwd="backend",
            #                check=True)
            # subprocess.run([sys.executable, "-m", "flask", "db", "upgrade"], cwd=".", check=True)
            # subprocess.run([sys.executable, "-m", "flask", "db", "migrate", "-m", "Auto migration"], cwd=".",
            #                check=True)
            #
            # print("DB migration done.")

        except:
            pass

    else:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
        from create_database import create_database
        create_database()
        print(f"Database '{DB_NAME}' was created")

    try:
        if os.environ.get("IS_DOCKER") == 'true':
            subprocess.run(["sh", 'run_migrations.sh'], check=True)
            print("Migrácie boli úspešne aplikované.")
        else:
            pass
    except Exception as e:
        print(e)

    cursor.close()
    conn.close()


if __name__ == '__main__':
    check_database_exists()
    APP_PORT = os.getenv('APP_PORT')

    app.run(debug=True, host='0.0.0.0', port=APP_PORT)
