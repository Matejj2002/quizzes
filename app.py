from flask import Flask, session, jsonify, request
from flask_migrate import Migrate
from flask_admin import Admin
from flask_dance.contrib.github import make_github_blueprint
from flask_cors import CORS
from src.backend.views import *
from src.backend.models import *
from graphviz import Digraph
import os

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
migrate = Migrate(app, db)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quizzes.db'
app.config['SQLALCHEMY_ECHO'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = not app.debug

db.init_app(app)

blueprint = make_github_blueprint(
    client_id="Ov23lieQz4ZgXYOsohz8",
    client_secret="fb0fedccfd01d5922305db0f4c5bab429d7c1e3f",
    redirect_to='index'
)
app.register_blueprint(blueprint, url_prefix="/login")

admin = Admin(app, name='Admin - Quizzes', template_mode='bootstrap3', index_view=MyAdminIndexView())
admin.add_view(PolymorphicModelView(User, db.session))
admin.add_view(PolymorphicModelView(Teacher, db.session))
admin.add_view(QuestionView(Question, db.session))
admin.add_view(QuestionVersionView(QuestionVersion, db.session))
admin.add_view(CategoryView(Category, db.session))


class ChoiceView(ModelView):
    column_list = ('id', 'text', 'choice_question_id')
    form_columns = ('text', 'choice_question_id')
    column_searchable_list = ['text']


admin.add_view(ChoiceView(Choice, db.session))


@app.route('/')
def index():
    if not github.authorized:
        return redirect(url_for('github.login'))

    resp = github.get('/user')
    if resp.ok:
        user_info = resp.json()

        return f"""
            <h1>Hello, {user_info["login"]}!</h1>
            <p>You are authenticated via GitHub.</p>
            <form action="/logout" method="post" target="_blank">
                <button type="submit">Logout</button>
            </form>
            """


@app.route('/categories')
def categories():
    if github.authorized:
        root_categories = Category.query.filter(Category.supercategory_id == None).all()
        category_graph = draw_category_graph(root_categories)
        category_graph.render('static/category_hierarchy')
        return '<img src= "static/category_hierarchy.png">'
    else:
        abort(403)


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect("https://github.com/logout?return_to=" + url_for('index', _external=True))


@app.route('/api/questions/', methods=['GET'])
def get_questions():
    limit = request.args.get('limit', default=10, type=int)
    offset = request.args.get('offset', default=10, type=int)
    sort = request.args.get('sort', default="", type=str)
    act_cat = request.args.get('actualCategory', default=1, type=int)
    filters = request.args.get("filterType", default="", type=str)
    author_filter = request.args.get("authorFilterDec", default="", type=str)

    if filters == "Matching Question":
        filters = "matching_answer_question"

    if filters == "Short Question":
        filters = "short_answer_question"

    if filters == "Multiple Choice Question":
        filters = "multiple_answer_question"
    if filters == ['']:
        change_fil = True
    else:
        change_fil = False
    try:
        questions = category_show_helper(act_cat)
        all_questions = [{"number_of_questions": len(questions)}, {'filters': change_fil}]
        questions_write = []

        counter = 0
        for question in questions:
            if not question['is_deleted'] and (question['versions']['type'] in filters or filters == '') and (
                    author_filter == 'All' or author_filter == "" or question['versions'][
                'author_name'] == author_filter):
                counter += 1

                if question['versions']['text'] is not None:
                    pass
                else:
                    question['versions']['text'] = ""
                versions = question['versions']
                question_dict = {
                    'id': question['id'],
                    "category_id": question['category_id'],
                    "category": question['category'],
                    "versions": versions
                }

                questions_write.append(question_dict)

        if sort == 'Newest':
            questions_write = sorted(
                questions_write,
                key=lambda q: datetime.datetime.strptime(q['versions']['dateCreated'], '%Y-%m-%d %H:%M:%S'),

            )
            questions_write = questions_write[::-1]

        if sort == 'Oldest':
            questions_write = sorted(
                questions_write,
                key=lambda q: datetime.datetime.strptime(q['versions']['dateCreated'], '%Y-%m-%d %H:%M:%S'),
            )

        if sort == 'Alphabetic':
            questions_write = sorted(
                questions_write,
                key=lambda q: q['versions']['title'].lower(),
            )

        if sort == 'Reverse Alphabetic':
            questions_write = sorted(
                questions_write,
                key=lambda q: q['versions']['title'].lower(),
                reverse=True
            )

        questions_write = questions_write[offset:offset + limit]
        all_questions[0]['number_of_questions'] = counter
        all_questions[0]['number_of_all_questions'] = len(questions)
        all_questions.append(questions_write)

        return jsonify(all_questions), 200

    except Exception as e:
        return jsonify({}), 404


@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    teachers = Teacher.query.all()

    all_teachers = []
    for i in teachers:
        teacher_dict = {
            "name": i.name,
            "id": i.id
        }

        all_teachers.append(teacher_dict)

    return jsonify(all_teachers), 200


def fetch_question_data(question_id):
    question = Question.query.get_or_404(question_id)

    versions = question.question_version

    versions_list = [
        {
            "id": version.id,
            "title": version.title,
            "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
            "author_id": version.author_id,
            "author_name": version.author.name,
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


@app.route('/api/questions-update/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question_data = fetch_question_data(question_id)
    return jsonify(question_data)


@app.route('/api/categories_show/<int:category_id>')
def categories_show(category_id):
    result = category_show_helper(category_id)

    return jsonify(result), 200


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


@app.route('/api/categories/new-category', methods=["PUT"])
def new_category():
    data = request.get_json()

    new_categor = Category(
        supercategory_id=data['supercategory'],
        title=data['title'],
        stug=data['slug']
    )

    db.session.add(new_categor)
    db.session.commit()

    return jsonify({}), 200


@app.route('/api/categories', methods=['GET'])
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


@app.route('/api/questions/<int:question_id>/versions', methods=['GET'])
def get_question_versions(question_id):
    question = Question.query.get_or_404(question_id)

    versions = question.question_version

    versions_list = [
        {
            "id": version.id,
            "title": version.title,
            "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
            "author_id": version.author_id,

        }
        for version in versions
    ]

    return jsonify({
        "question_id": question.id,
        "question_title": question.title,
        "versions": versions_list
    }), 200


@app.route('/api/questions/new-question', methods=['PUT'])
def add_new_question():
    data = request.get_json()

    category_id = data['category_id']
    title = data['title']
    text = data['text']
    answers = data['answers']

    question = Question(category_id=category_id)
    db.session.add(question)
    db.session.commit()

    question_id = question.id
    if data['questionType'] == 'Matching Question':
        question_type = MatchingQuestion
        type_q = 'matching_answer_question'
    elif data['questionType'] == 'Short Question':
        question_type = ShortAnswerQuestion
        type_q = 'short_answer_question'
    else:
        question_type = MultipleChoiceQuestion
        type_q = 'multiple_answer_question'

    question_version = question_type(question_id=question_id,
                                     title=title,
                                     text=text,
                                     dateCreated=datetime.datetime.now(),
                                     author_id=1,  # potom upravit
                                     type=type_q
                                     )

    db.session.add(question_version)
    db.session.commit()

    question_version_id = question_version.id

    if type_q == 'multiple_answer_question':
        texts = answers['MultipleChoiceQuestion']['text']
        correct_answers = answers['MultipleChoiceQuestion']['correct_answers']
        is_single = answers['MultipleChoiceQuestion']['is_single']
        feedback = answers['MultipleChoiceQuestion']['feedback']
        for i in range(len(texts)):
            choice = Choice(choice_question_id=question_version_id,
                            text=texts[i],
                            positive_feedback=feedback[i]["positive"],
                            negative_feedback=feedback[i]["negative"],
                            is_correct=correct_answers[i],
                            is_single=is_single,
                            type='choice_answer')
            db.session.add(choice)

    if type_q == 'short_answer_question':
        answer = answers['ShortAnswerQuestion']
        short_answer = ShortAnswer(
            short_answer_question_id=question_version_id,
            text=answer['text'],
            is_regex=answer['is_regex'],
            is_correct=True,
            positive_feedback=answer["positive_feedback"],
            negative_feedback=answer["negative_feedback"],
            type='simple_answer'
        )
        db.session.add(short_answer)

    if type_q == 'matching_answer_question':
        for i in answers['MatchingQuestion']:
            matching_pair = MatchingPair(
                matching_question_id=question_version_id,
                leftSide=i['left'],
                rightSide=i['right'],
                positive_feedback=i['positive'],
                negative_feedback=i['negative'],
                type='matching_pair'
            )

            db.session.add(matching_pair)

    db.session.commit()

    return jsonify({}), 200


@app.route('/api/question-version-choice/<int:question_id>', methods=['GET'])
def get_question_version_choice(question_id):
    question = Question.query.get_or_404(question_id)

    newest_version = None
    for i in question.question_version:
        if newest_version is None:
            newest_version = i
        elif i.dateCreated > newest_version.dateCreated:
            newest_version = i

    dict_ret = {
        "question_id": question.id,
        "category_id": question.category.id,
        "category_name": question.category.title,
        "title": newest_version.title,
        "dateCreted": newest_version.dateCreated,
        "text": newest_version.text,
        "type": newest_version.type,
        "feedback": [

        ],
        "answers": [

        ]

    }

    if newest_version.type == 'matching_answer_question':
        for i in newest_version.matching_question:
            dict_ret['answers'].append(
                {"left": i.leftSide,
                 "right": i.rightSide,
                 "positive": i.positive_feedback,
                 "negative": i.negative_feedback
                 }
            )

    if newest_version.type == 'multiple_answer_question':
        texts = []
        correct_ans = []
        feedback = []
        for i in newest_version.multiple_answers:
            texts.append(i.text)
            correct_ans.append(i.is_correct)
            feedback.append(
                {"positive": i.positive_feedback, "negative": i.negative_feedback}
            )

        dict_ret['answers'] = {
            "texts": texts,
            "correct_ans": correct_ans,
            "feedback": feedback
        }

    if newest_version.type == 'short_answer_question':
        for i in newest_version.short_answers:
            dict_ret["answers"].append(
                [
                    i.text,
                    i.is_regex,
                    i.positive_feedback,
                    i.negative_feedback
                ]
            )

    return jsonify(dict_ret), 200


@app.route('/api/questions/categories/get-path-to-supercategory/<int:index>', methods=['GET'])
def get_path_to_supercategory(index):
    category = Category.query.get_or_404(index)

    super_cat = Category.query.get(category.supercategory_id)
    path = [[category.title, category.id]]
    while super_cat is not None:
        path.append([super_cat.title, super_cat.id])
        super_cat = Category.query.get(super_cat.supercategory_id)

    return jsonify(path), 200


@app.route('/api/questions/versions/<int:id>', methods=['PUT'])
def add_question_version(id):
    data = request.get_json()
    answers = data['answers']

    if data['questionType'] == 'Matching Question':
        question_type = MatchingQuestion
        type_q = 'matching_answer_question'
    elif data['questionType'] == 'Short Question':
        question_type = ShortAnswerQuestion
        type_q = 'short_answer_question'
    else:
        question_type = MultipleChoiceQuestion
        type_q = 'multiple_answer_question'

    question_version = question_type(question_id=id,
                                     title=data['title'],
                                     text=data['text'],
                                     dateCreated=datetime.datetime.now(),
                                     author_id=1,
                                     type=type_q
                                     )

    db.session.add(question_version)
    db.session.commit()

    question_version_id = question_version.id

    if type_q == 'multiple_answer_question':
        texts = answers['MultipleChoiceQuestion']['text']
        correct_answers = answers['MultipleChoiceQuestion']['correct_answers']
        is_single = answers['MultipleChoiceQuestion']['is_single']
        feedback = answers['MultipleChoiceQuestion']['feedback']
        for i in range(len(texts)):
            choice = Choice(choice_question_id=question_version_id,
                            text=texts[i],
                            positive_feedback=feedback[i]["positive"],
                            negative_feedback=feedback[i]["negative"],
                            is_single=is_single,
                            is_correct=correct_answers[i],
                            type='choice_answer')
            db.session.add(choice)

    if type_q == 'short_answer_question':
        answer = answers['ShortAnswerQuestion']
        short_answer = ShortAnswer(
            short_answer_question_id=question_version_id,
            text=answer['text'],
            is_regex=answer['is_regex'],
            is_correct=True,
            positive_feedback=answer["positive_feedback"],
            negative_feedback=answer["negative_feedback"],
            type='simple_answer'
        )
        db.session.add(short_answer)

    if type_q == 'matching_answer_question':
        for i in answers['MatchingQuestion']:
            matching_pair = MatchingPair(
                matching_question_id=question_version_id,
                leftSide=i['left'],
                rightSide=i['right'],
                positive_feedback=i['positive'],
                negative_feedback=i['negative'],
                type='matching_pair'
            )

            db.session.add(matching_pair)

    db.session.commit()

    question_version_dict = {
        "id": question_version.id,
        "title": question_version.title,
        "dateCreated": question_version.dateCreated.strftime('%Y-%m-%d %H:%M:%S'),
        "author_id": question_version.author_id,
        "text": question_version.text,
        "type": question_version.type
    }

    return jsonify(question_version_dict), 200


@app.route("/api/get-category-tree", methods=["GET"])
def get_tree_categories():
    return tree_categories(Category.query.get_or_404(1))


def tree_categories(node):
    result = {
        "title": node.title,
        "id": node.id,
        "children": [tree_categories(child) for child in node.subcategories]
    }
    return result


def draw_category_graph(categories, graph=None, parent=None):
    if graph is None:
        graph = Digraph(format='png', engine='dot')
        graph.attr(rankdir='LR')

    for category in categories:
        graph.node(str(category.id), category.title)
        if parent:
            graph.edge(str(parent.id), str(category.id))

        if category.subcategories:
            draw_category_graph(category.subcategories, graph, category)
    return graph


if __name__ == '__main__':
    with app.app_context():
        import sys

        # sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.venv/Lib//site-packages'))

        # print('AA')
        # db.drop_all()
        # db.create_all()
        # print('Database created and tables initialized!')
        # supercategory = Category(title="supercategory")
        # db.session.add(supercategory)
        # db.session.commit()
        #
        # teacher_matej = Teacher(name="Matej Gornal", github_name="Matejj2002")
        # db.session.add(teacher_matej)
        # db.session.commit()
        # print("Teacher added.")
        pass

    app.run(debug=True)
