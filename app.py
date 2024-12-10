from flask import Flask, session, jsonify, request
from flask_admin import Admin
from flask_dance.contrib.github import make_github_blueprint
from flask_cors import CORS
from src.backend.views import *
from src.backend.models import *
from graphviz import Digraph
import os

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
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


@app.route('/api/questions', methods=['GET'])
def get_questions():
    try:
        questions = Question.query.all()
        all_questions = []
        ind = 0
        for question in questions:
            versions = question.question_version
            all_versions = []
            for version in versions:
                version_dict = {
                    "id": version.id,
                    "title": version.title,
                    "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
                    "author_id": version.author_id,
                    'author_name': version.author.name,
                    "text": version.text,
                    "type": version.type
                }
                all_versions.append(version_dict)

            if len(versions) > 0:
                newest_version = max(
                    all_versions,
                    key=lambda x: datetime.datetime.strptime(x['dateCreated'], '%Y-%m-%d %H:%M:%S')
                )
            else:
                newest_version = None

            question_dict = {
                'id': question.id,
                "category_id": question.category_id,
                "category": question.category.title if question.category else None,
                "versions": newest_version
            }

            all_questions.append(question_dict)

        return jsonify(all_questions), 200
    except Exception as e:
        jsonify(' '), 404


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
            "text": version.text
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
        "category": question.category.title if question.category else None,
        "versions": newest_version,
        "author_id": newest_version['author_id'],
        "author_name": newest_version['author_name']
    }

    return question_dict


@app.route('/api/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question_data = fetch_question_data(question_id)
    return jsonify(question_data)


@app.route('/api/categories_show/<int:category_id>')
def categories_show(category_id):
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

    return jsonify(result), 200


@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()

    dict_categories = [
        {
            "id": category.id,
            "title": category.title
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
    if data['questionType'] == 'MatchingQuestion':
        question_type = MatchingQuestion
        type_q = 'matching_answer_question'
    elif data['questionType'] == 'ShortAnswerQuestion':
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
        if len(answers['MultipleChoiceQuestion']) == 1:
            is_single = True
        else:
            is_single = False

        for i in answers['MultipleChoiceQuestion']:
            choice = Choice(choice_question_id=question_version_id,
                            text=i,
                            positive_feedback='',
                            negative_feedback='',
                            # is_single=is_single,
                            type='choice_answer')
            db.session.add(choice)

    if type_q == 'short_answer_question':
        answer = answers['ShortAnswerQuestion']
        short_answer = ShortAnswer(
            short_answer_question_id=question_version_id,
            text=answer['text'],
            is_regex=answer['is_regex'],
            is_correct=answer['is_correct'],
            positive_feedback='',
            negative_feedback='',
            type='simple_answer'
        )
        db.session.add(short_answer)

    if type_q == 'matching_answer_question':
        for i in answers['MatchingQuestion']:
            matching_pair = MatchingPair(
                matching_question_id=question_version_id,
                leftSide=i['left'],
                rightSide=i['right'],
                positive_feedback='',
                negative_feedback='',
                type='matching_pair'
            )

            db.session.add(matching_pair)

    db.session.commit()

    return jsonify({}), 200


@app.route('/api/question-version-choice/<int:question_id>', methods=['GET'])
def get_question_version_choice(question_id):
    question = Question.query.get_or_404(question_id)
    print(question.id)
    print(question.question_version)

    newest_version = None
    for i in question.question_version:
        if newest_version is None:
            newest_version = i
        elif i.dateCreated > newest_version.dateCreated:
            newest_version = i

    # dorobit

    texts = []
    if newest_version.type == 'multiple_answer_question':
        print(newest_version.multiple_answers)
        for i in newest_version.multiple_answers:
            texts.append(i.text)

    if newest_version.type == 'short_answer_question':
        for i in newest_version.short_answers:
            texts.append([i.text, i.is_regex, i.is_correct])

    if newest_version.type == 'matching_answer_question':
        for i in newest_version.matching_question:
            texts.append([i.leftSide, i.rightSide])

    ret_dict = {
        "type": newest_version.type,
        "texts": texts
    }

    return jsonify(ret_dict), 200


@app.route('/api/questions/versions/<int:id>', methods=['PUT'])
def add_question_version(id):
    data = request.get_json()
    print(f"Ukladám otázku s ID {id}, nový text: {data['text']}")
    answers = data['answers']

    if data['questionType'] == 'MatchingQuestion':
        question_type = MatchingQuestion
        type_q = 'matching_answer_question'
    elif data['questionType'] == 'ShortAnswerQuestion':
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
        if len(answers['MultipleChoiceQuestion']) == 1:
            is_single = True
        else:
            is_single = False

        for i in answers['MultipleChoiceQuestion']:
            choice = Choice(choice_question_id=question_version_id,
                            text=i,
                            positive_feedback='',
                            negative_feedback='',
                            # is_single=is_single,
                            type='choice_answer')
            db.session.add(choice)

    if type_q == 'short_answer_question':
        answer = answers['ShortAnswerQuestion']
        short_answer = ShortAnswer(
            short_answer_question_id=question_version_id,
            text=answer['text'],
            is_regex=answer['is_regex'],
            is_correct=answer['is_correct'],
            positive_feedback='',
            negative_feedback='',
            type='simple_answer'
        )
        db.session.add(short_answer)

    if type_q == 'matching_answer_question':
        for i in answers['MatchingQuestion']:
            matching_pair = MatchingPair(
                matching_question_id=question_version_id,
                leftSide=i['left'],
                rightSide=i['right'],
                positive_feedback='',
                negative_feedback='',
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
