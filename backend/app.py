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
from flask import abort

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
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
API_URL = os.getenv('API_URL')
APP_PORT = os.getenv('APP_PORT')

envs = {
    "DB_PORT": DB_PORT,
    "APP_BASENAME": APP_BASENAME,
    "DB_NAME": DB_NAME,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
    "API_URL": API_URL,
    "APP_PORT": APP_PORT
}
check_start_env = []
for key, val in envs.items():
    if val is None:
        check_start_env.append(key)

if len(check_start_env) == 0:
    DB_HOST = "localhost"
    if os.environ.get("IS_DOCKER") == 'true':
        DB_HOST = os.getenv('DB_HOST')

    db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url

    # app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    #     'pool_size': 20,
    #     'max_overflow': 10,
    #     'pool_timeout': 30,
    #     'pool_recycle': 1800
    # }

    app.config['SQLALCHEMY_ECHO'] = False
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_SECURE'] = not app.debug
    app.config['SESSION_TYPE'] = 'filesystem'
    Session(app)

    db.init_app(app)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith(API_URL):
        abort(404)

    if path.startswith("quizzes/"):
        path = path.replace("quizzes/", "", 1)


    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def check_database_exists():
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()

    try:
        cursor.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [DB_NAME])
        exists_db = cursor.fetchone()

        if exists_db:
            cursor.execute(
                sql.SQL("SELECT * FROM categories WHERE title = %s"),
                ["supercategory"]
            )
            exists_cat = cursor.fetchone()
        else:
            exists_cat = False

        if exists_cat:
            print(f"Database '{DB_NAME}' already existing")

        else:
            try:
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
            except:
                pass

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
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    if len(check_start_env) == 0:
        check_database_exists()
        app.run(debug=True, host='0.0.0.0', port=APP_PORT)
    else:
        print("---Missing variables in .env file.---")
        for i in check_start_env:
            print(i, " can't be empty in .env file")
        print("-------------------------------------")
