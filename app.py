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
        "versions": newest_version
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


@app.route('/api/questions/new-question', methods = ['PUT'])
def add_new_question():
    data = request.get_json()

    category_id = data['category_id']
    title = data['title']
    text = data['text']

    question = Question(title='', category_id = category_id)
    db.session.add(question)
    db.session.commit()

    question_id = question.id

    question_version = QuestionVersion(question_id=question_id,
                                       title=title,
                                       text=text,
                                       dateCreated=datetime.datetime.now(),
                                       author_id=1, #potom upravit
                                       type='question_version' #potom upravit
                                       )

    db.session.add(question_version)
    db.session.commit()


    return jsonify({}), 200

@app.route('/api/questions/versions/<int:id>', methods=['PUT'])
def add_question_version(id):
    data = request.get_json()
    print(f"Ukladám otázku s ID {id}, nový text: {data['text']}")

    question = Question.query.get_or_404(id)
    versions = question.question_version

    versions_list = [
        {
            "id": version.id,
            "title": version.title,
            "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
            "author_id": version.author_id,
            "text": version.text,
            "type": version.type
        }
        for version in versions
    ]

    newest_version = max(
        versions_list,
        key=lambda x: datetime.datetime.strptime(x['dateCreated'], '%Y-%m-%d %H:%M:%S')
    )

    question_version = QuestionVersion(question_id=id,
                                       title=data['title'],
                                       text=data['text'],
                                       dateCreated=datetime.datetime.now(),
                                       author_id=newest_version['author_id'],
                                       type=newest_version['type']
                                       )

    db.session.add(question_version)
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
