from flask import Blueprint, request, jsonify
import requests
try:
    from backend.functions.api_functions import *
except:
    from functions.api_functions import *

categories_bp = Blueprint('categories', __name__, url_prefix='/api/')

@categories_bp.route('/categories_show/<int:category_id>')
def categories_show(category_id):
    result = category_show_helper(category_id)

    return jsonify(result), 200

@categories_bp.route('/categories/new-category', methods=["PUT"])
def new_category():
    data = request.get_json()

    if data["supercategory"] == 0:
        data["supercategory"] = None

    new_categor = Category(
        supercategory_id=data['supercategory'],
        title=data['title'],
        stug=data['slug']
    )

    db.session.add(new_categor)
    db.session.commit()

    return jsonify({}), 200

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()

    dict_categories = [
        {
            "id": category.id,
            "title": category.title,
            "slug": category.stug
        }

        for category in categories
    ]

    return jsonify(dict_categories), 200

@categories_bp.route("/get-category-tree", methods=["GET"])
def get_tree_categories():
    result = tree_categories(Category.query.get_or_404(1))
    result['title'] = ""
    return result

@categories_bp.route("/get-category-tree-array", methods=["GET"])
def get_category_to_select():
    cat = tree_categories(Category.query.get_or_404(1))
    result = generate_category_tree(cat)
    result.pop(0)
    return result

