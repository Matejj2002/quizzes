from flask import Blueprint, request, jsonify
import requests
try:
    from backend.functions.api_functions import *
except:
    from functions.api_functions import *

API_URL = os.getenv('API_URL')
users_bp = Blueprint('users', __name__, url_prefix=API_URL)

@users_bp.route('/teachers', methods=['GET'])
def get_teachers():
    teachers = User.query.filter(User.user_type == 'teacher').all()

    all_teachers = []
    for i in teachers:
        teacher_dict = {
            "name": i.github_name,
            "id": i.id
        }

        all_teachers.append(teacher_dict)

    return jsonify(all_teachers), 200

@users_bp.route("/get-users", methods=["GET"])
def get_all_users():
    sort = request.args.get("sort")
    sort_dir = request.args.get("sortDirection")
    name_filter = request.args.get("filterName")

    users = User.query.all()

    user_table = []
    for user in users:
        if name_filter != "":
            if user.github_name.startswith(name_filter):
                user_table.append(
                    {"github_name": user.github_name,
                     "user_type": user.user_type.capitalize(),
                     "id": user.id
                     }
                )
        else:
            user_table.append(
                {"github_name": user.github_name,
                 "user_type": user.user_type.capitalize(),
                 "id": user.id
                 }
            )

    user_table.sort(key=lambda x: x[sort].lower(), reverse=sort_dir == "asc")
    return {"result": user_table}, 200

@users_bp.route("/create-teacher", methods=["PUT"])
def create_teacher():
    data = request.get_json()

    new_teacher = User(name=data["name"], github_name=data["githubName"], user_type="teacher")
    db.session.add(new_teacher)
    db.session.commit()

    return {}, 200

@users_bp.route("/change-user-type", methods=["PUT"])
def change_user_type():
    data = request.get_json()

    try:
        user = User.query.filter(User.id == data["userId"]).first()

        user.user_type = data["selectedType"].lower()
        db.session.add(user)
        db.session.commit()

        return {}, 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

