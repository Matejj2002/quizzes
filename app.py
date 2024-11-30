from flask import Flask, session
from flask_admin import Admin
from flask_dance.contrib.github import make_github_blueprint
from src.backend.views import *
from src.backend.models import *
from graphviz import Digraph
import os

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quizzes.db'
app.config['SQLALCHEMY_ECHO'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = True

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
admin.add_view(PolymorphicModelView(Student, db.session))
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
        print('AA')
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

    app.run(debug=True)
