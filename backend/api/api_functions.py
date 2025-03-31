import os
if os.environ.get("IS_DOCKER") == 'true':
    from models.views import *
    from models.models import *
else:
    from backend.models.views import *
    from backend.models.models import *


def fetch_question_data(question_id):
    question = Question.query.get_or_404(question_id)

    versions = question.question_version

    versions_list = [
        {
            "id": version.id,
            "title": version.title,
            "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
            "author_id": version.author_id,
            "author_name": version.author.github_name,
            "text": version.text,
            "type": version.type
        }
        for version in versions
    ]

    if len(versions) > 0:
        newest_version = max(
            versions_list,
            key=lambda x: datetime.datetime.strptime(x['dateCreated'], '%Y-%m-%d %H:%M:%S')
        )
    else:
        newest_version = None

    question_dict = {
        'id': question.id,
        "category_id": question.category_id,
        "is_deleted": question.is_deleted,
        "category": question.category.title if question.category else None,
        "versions": newest_version,
        "author_id": newest_version['author_id'],
        "author_name": newest_version['author_name'],
        "type": newest_version['type'],
    }

    return question_dict

def category_show_helper(category_id):
    category = Category.query.get_or_404(category_id)

    visited = set()
    visited.add(category)

    visited_id = set()
    visited_id.add(category.id)

    category_set = set()
    category_set.add(category)

    while len(category_set) != 0:
        category_set_pom = set()
        for category in category_set:

            for cat1 in category.subcategories.all():
                if not cat1 in visited:
                    category_set_pom.add(cat1)
                    visited.add(cat1)
                    visited_id.add(cat1.id)
        category_set = category_set_pom

    questions = Question.query.all()

    result = []

    for question in questions:
        if question.category_id in visited_id:
            result.append(
                fetch_question_data(question.id)
            )

    return result

def tree_categories(node):
    result = {
        "title": node.title,
        "id": node.id,
        "children": [tree_categories(child) for child in node.subcategories]
    }
    return result


def list_subcategories(node):
    subcategories = []

    def traverse(node):
        for child in node.subcategories:
            subcategories.append({"title": child.title, "id": child.id})
            traverse(child)

    traverse(node)
    return subcategories


def generate_category_tree(category, level=0):
    result = [{
        "id": category["id"],
        "title": f"{'– ' * (level - 1)}{category['title']}"
    }]

    if category.get("children"):
        for i in category['children']:
            result.extend(generate_category_tree(i, level + 1))

    return result


def get_questions_from_category_helper(subcat, question_type, index):
    type_sel = []
    if question_type == 1:
        type_sel = ["short_answer_question", "matching_answer_question", "multiple_answer_question"]
    if question_type == 2:
        type_sel = ["matching_answer_question"]
    if question_type == 3:
        type_sel = ["short_answer_question"]
    if question_type == 4:
        type_sel = ["multiple_answer_question"]

    questions = []
    if subcat == 'true':
        cats = list_subcategories(Category.query.get_or_404(index))
        for i in cats:
            pom_questions = Question.query.filter_by(category_id=i['id']).all()
            questions.extend(pom_questions)

    questions.extend(Question.query.filter_by(category_id=index).all())

    questions_versions = []
    for i in questions:
        latest_version = max(i.question_version, key=lambda v: v.dateCreated)

        if latest_version.type in type_sel and not i.is_deleted:
            author = Teacher.query.get_or_404(latest_version.author_id).name
            version = {
                "id": i.id,  # Question.id
                "title": latest_version.title,
                "text": latest_version.text,
                "type": latest_version.type,
                "dateCreated": latest_version.dateCreated,
                "authorName": author
            }
            questions_versions.append(version)

    return questions_versions