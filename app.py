from flask import Flask, session, jsonify, request
from flask_migrate import Migrate
from flask_admin import Admin
from flask_dance.contrib.github import make_github_blueprint
from flask_cors import CORS
from src.backend.api_functions import *
from flask_session import Session
import requests
from dotenv import load_dotenv
import os

load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
migrate = Migrate(app, db)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/quizzes"
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quizzes.db'
app.config['SQLALCHEMY_ECHO'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = not app.debug
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

db.init_app(app)

blueprint = make_github_blueprint(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    redirect_to='index'
)
app.register_blueprint(blueprint, url_prefix="/login")

admin = Admin(app, name='Admin - Quizzes', template_mode='bootstrap3', index_view=MyAdminIndexView())
admin.add_view(PolymorphicModelView(User, db.session))
admin.add_view(PolymorphicModelView(Teacher, db.session))
admin.add_view(QuestionView(Question, db.session))
admin.add_view(QuestionVersionView(QuestionVersion, db.session))
admin.add_view(CategoryView(Category, db.session))
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


@app.route('/check-logged')
def logged_in():
    if not github.authorized:
        return {"logged": False}

    return {"logged": True}


@app.route('/getAccessToken', methods=['GET'])
def get_access_token():
    CLIENT_ID = "Ov23likPzKaEmFtQM7kn"
    CLIENT_SECRET = "a75b4914df0b956f87bf79d9dfaba76d5b64a96b"
    code = request.args.get('code')

    params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code
    }

    url = "https://github.com/login/oauth/access_token"
    headers = {'Accept': 'application/json'}
    response = requests.post(url, params=params, headers=headers)

    print(response.json())
    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to retrieve access token"}), response.status_code


@app.route('/getUserData', methods=['GET'])
def get_user_data():
    authorization_header = request.headers.get('Authorization')

    if not authorization_header:
        return jsonify({"error": "Authorization header missing"}), 401

    url = "https://api.github.com/user"
    headers = {
        "Authorization": authorization_header
    }

    response = requests.get(url, headers=headers)

    if response.ok:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to retrieve user data"}), response.status_code


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
    question_filter = request.args.get("questionFilter", default="Active", type=str)

    cond = False
    if question_filter == "All":
        cond = True
    if question_filter == "Archived":
        cond = True

    if question_filter == "Active":
        cond = False

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
            if question_filter == "Active" or question_filter == "Archived":
                condition = (question['is_deleted'] == cond or question[
                    'is_deleted'] == None)  # musi byt, lebo na zaciatku tam nebol tento flag
            else:
                condition = True

            if condition and (question['versions']['type'] in filters or filters == '') and (
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
                    "is_deleted": question["is_deleted"],
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


@app.route('/api/questions/delete', methods=['PUT'])
def delete_question():
    data = request.get_json()
    question_id = data['id']
    delete = data['delete']

    if delete:
        question = Question.query.get_or_404(question_id)
        question.is_deleted = True
    else:
        question = Question.query.get_or_404(question_id)
        question.is_deleted = False
    db.session.commit()

    return jsonify({'deleted': delete})


@app.route('/api/questions-update/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question_data = fetch_question_data(question_id)
    return jsonify(question_data)


@app.route('/api/categories_show/<int:category_id>')
def categories_show(category_id):
    result = category_show_helper(category_id)

    return jsonify(result), 200


@app.route('/api/categories/new-category', methods=["PUT"])
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
    author = data['author']

    author_id = Teacher.query.filter_by(github_name=author).first()

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
                                     author_id=author_id.id,
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
                type='matching_pair',
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
    result = tree_categories(Category.query.get_or_404(1))
    result['title'] = ""
    return result


@app.route("/api/get-category-tree-array", methods=["GET"])
def get_category_to_select():
    cat = tree_categories(Category.query.get_or_404(1))
    result = generate_category_tree(cat)
    result.pop(0)
    return result


@app.route("/api/get_questions_category/<int:index>", methods=["GET"])
def get_questions_from_category(index):
    subcat = request.args.get('includeSubCat')
    question_type = int(request.args.get("typeQuestionSelected"))

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

        if latest_version.type in type_sel and (not i.is_deleted or i.is_deleted is None):
            author = Teacher.query.get_or_404(latest_version.author_id).name
            version = {
                "id": i.id,
                "title": latest_version.title,
                "text": latest_version.text,
                "type": latest_version.type,
                "dateCreated": latest_version.dateCreated,
                "authorName": author
            }
            questions_versions.append(version)

    return {"questions": questions_versions}


@app.route("/api/get-quiz-templates", methods=["GET"])
def get_quiz_templates():
    quiz_templates = QuizTemplate.query.all()

    result = []

    for template in quiz_templates:
        if template.is_deleted:
            continue

        template_sub = {
            "id": template.id,
            "title": template.title,
            "date_time_open": template.date_time_open,
            "date_time_close": template.date_time_close,
            "time_to_finish": template.time_to_finish,
            "shuffle_sections": template.shuffle_sections,
            "correction_of_attempts": template.correction_of_attempts,
            "number_of_corrections": template.number_of_corrections,
            "datetime_check": template.datetime_check,
            "order": template.order,
            "sections": []
        }
        section_count = 1
        for section in template.quiz_template_section:
            pom_section = {
                "sectionId": section_count,
                "title": section.title,
                "shuffle": section.shuffle,
                "order": section.order,
                "questions": []
            }
            section_count += 1

            for question_item in section.quiz_template_section_items:
                question = question_item.question

                if question is not None:
                    latest_version = max(question.question_version, key=lambda v: v.dateCreated)
                    pom_section["questions"].append(
                        {"id": question.id,
                         "author": latest_version.author.name,
                         "dateCreated": latest_version.dateCreated,
                         "evaluation": question_item.evaluate,
                         "questionType": "questions",
                         "title": latest_version.title,
                         "type": latest_version.type
                         }
                    )
                else:
                    pom_section["questions"].append(
                        {
                            "categoryId": question_item.category_id,
                            "categoryName": question_item.category.title,
                            "evaluation": question_item.evaluate,
                            "includeSubCategories": question_item.include_sub_categories,
                            "questionAnswerType": question_item.question_type,
                            "questionType": "random"
                        }
                    )
            template_sub["sections"].append(pom_section)

        result.append(template_sub)

    return {"result": result}, 200


@app.route("/api/archive-quiz", methods=["PUT"])
def archive_quiz():
    quiz_template_id = request.get_json()["quiz_template_id"]

    archive_quiz_template = QuizTemplate.query.filter_by(id=quiz_template_id).first()
    archive_quiz_template.is_deleted = True
    db.session.commit()

    return {}


@app.route("/api/update-quiz-template", methods=["PUT"])
def update_quiz_template():
    data = request.get_json()
    # quiz_template_id = data["quizId"]
    #
    # quiz_template = QuizTemplate.query.filter_by(id=quiz_template_id).first()
    # quiz_template.title = data["quizTitle"]
    # quiz_template.shuffle_sections = data["shuffleSections"]
    # quiz_template.correction_of_attempts = data["typeOfAttempts"]
    # quiz_template.number_of_corrections = data["numberOfCorrections"]
    # quiz_template.date_time_open = data["dateOpen"]
    # quiz_template.date_time_close = data["dateClose"]
    # quiz_template.time_to_finish = data["minutesToFinish"]
    # quiz_template.datetime_check = data["dateCheck"]
    #
    # db.session.commit()

    quiz_template = QuizTemplate.query.all()

    for quiz in quiz_template:
        db.session.delete(quiz)
        db.session.commit()




    return {}


@app.route("/api/new-quiz-template", methods=["PUT"])
def create_new_quiz_template():
    data = request.get_json()
    print(data)
    if data["quizId"] !=0:
        quiz_template = QuizTemplate.query.filter_by(id=data["quizId"]).first()
        db.session.delete(quiz_template)
        db.session.commit()

    quiz_template = QuizTemplate(
        title=data["quizTitle"],
        shuffle_sections=data['shuffleSections'],
        correction_of_attempts=data["typeOfAttempts"],
        number_of_corrections=data["numberOfCorrections"],
        date_time_open=data["dateOpen"],
        date_time_close=data["dateClose"],
        time_to_finish=data["minutesToFinish"],
        datetime_check=data["dateCheck"]
    )

    db.session.add(quiz_template)
    db.session.commit()

    quiz_template_id = quiz_template.id

    sections = []
    for section in data["sections"]:
        section_added = QuizTemplateSection(
            title=section["title"],
            description="",
            quiz_template_id=quiz_template_id,
            shuffle=section["shuffle"]
        )
        db.session.add(section_added)
        db.session.commit()

        sections.append(section_added)

        quiz_template_items = []
        for question in section["questions"]:
            if question["questionType"] == "questions":
                print(question)
                original_question = QuestionVersion.query.filter_by(question_id=question["id"]).first()
                question_item = QuizTemplateItem(
                    question_id=original_question.question_id,
                    evaluate=question["evaluation"],
                    item_section_id=section_added.id
                )

                db.session.add(question_item)
                db.session.commit()
                quiz_template_items.append(question_item)

            else:
                question_item = QuizTemplateItem(
                    item_section_id=section_added.id,
                    category_id=question["categoryId"],
                    evaluate=question["evaluation"],
                    include_sub_categories=question["includeSubCategories"],
                    question_type=question["questionAnswerType"]

                )

                db.session.add(question_item)
                db.session.commit()
                quiz_template_items.append(question_item)

        ordered_items = []
        for i in quiz_template_items:
            ordered_items.append(i.id)

        section_added.order = ordered_items

        db.session.commit()

    ordered_sections_ids = []
    for i in sections:
        ordered_sections_ids.append(i.id)

    quiz_template.order = ordered_sections_ids

    db.session.commit()

    return {}, 200


if __name__ == '__main__':
    with app.app_context():
        import sys

        # sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.venv/Lib//site-packages'))

        # print('AA')
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
