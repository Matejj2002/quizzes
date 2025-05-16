from flask import Blueprint, request, jsonify
import requests
try:
    from backend.functions.api_functions import *
except:
    from functions.api_functions import *

API_URL = os.getenv('API_URL')

auth_bp = Blueprint('auth', __name__, url_prefix=API_URL)

@auth_bp.route('/getAccessToken', methods=['GET'])
def get_access_token():
    CLIENT_ID = os.getenv('CLIENT_ID')
    CLIENT_SECRET = os.getenv('CLIENT_SECRET')

    code = request.args.get('code')

    params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code
    }

    url = "https://github.com/login/oauth/access_token"
    headers = {'Accept': 'application/json'}
    response = requests.post(url, params=params, headers=headers)

    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to retrieve access token"}), response.status_code

@auth_bp.route('/getUserData', methods=['GET'])
def get_user_data():
    authorization_header = request.headers.get('Authorization')
    print("USERDATACALLS")
    if not authorization_header:
        return jsonify({"error": "Authorization header missing"}), 401

    url = "https://api.github.com/user"
    headers = {
        "Authorization": authorization_header
    }

    response = requests.get(url, headers=headers)

    if response.ok:
        data = response.json()

        users = User.query.all()
        if len(users) == 0:
            teacher = User(
                name=data["login"],
                github_name=data["login"],
                user_type="teacher"
            )

            role = "teacher"

            db.session.add(teacher)
            db.session.commit()

            id_user = teacher.id

        else:
            user = User.query.filter(User.github_name == data["login"]).first()

            if user is None:
                student = User(
                    name=data["login"],
                    github_name=data["login"],
                    user_type="student"
                )
                role = "student"

                db.session.add(student)
                db.session.commit()

                id_user = student.id

            else:
                role = user.user_type
                id_user = user.id

        data["role"] = role
        data["id_user"] = id_user
        data["error"] = "no error"

        return jsonify(data)
    else:
        return jsonify({"error": "Failed to retrieve user data"})
@auth_bp.route('/get-user-data_logged', methods=['GET'])
def get_user_data_logged():
    user_name = request.args.get("userName")
    avatar_url = request.args.get("avatarUrl")

    user = User.query.filter(User.github_name == user_name).first()
    if user is None:
        return {"result": {"id_user": "", "login": "", "avatar_url": "", "role": ""}}
    return {"result": {"id_user": user.id, "login": user_name, "avatar_url": avatar_url, "role": user.user_type}}