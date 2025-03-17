import random
import json
from flask import Flask, session, jsonify, request
from flask_migrate import Migrate
from flask_admin import Admin
from flask_dance.contrib.github import make_github_blueprint
from flask_cors import CORS
from src.backend.api_functions import *
from flask_session import Session
import requests
from dotenv import load_dotenv
from sqlalchemy import desc
import pytz
import os

load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
migrate = Migrate(app, db)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/quizzes"
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

    cond = True
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
                condition = question['is_deleted'] == cond
            else:
                condition = True

            if condition and (question['versions']['type'] in filters or filters == '') and (
                    author_filter == 'All' or author_filter == ""
                    or question['versions']['author_name'] == author_filter):

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
        return jsonify({"error": e}), 404


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
    feedback = data["feedback"]

    author_id = Teacher.query.filter_by(github_name=author).first()

    question = Question(category_id=category_id,
                        question_feedback=feedback
                        )
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
        "question_feedback": question.question_feedback,
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

    question = Question.query.get_or_404(id)
    question.question_feedback = data["feedback"]
    db.session.commit()

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

    questions_versions = get_questions_from_category_helper(subcat, question_type, index)

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
            "feedbackType": template.feedback_type,
            "quiz_id": 0,
            "sections": [],
            "is_finished": False,
            "first_generation": False,
            "number_of_questions": 0
        }
        question_count = 0
        section_count = 1
        for section in template.quiz_template_section:
            pom_section = {
                "sectionId": section_count,
                "title": section.title,
                "shuffle": section.shuffle,
                "order": section.order,
                "questions": [],
                "section_id": section.id
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
                         "type": latest_version.type,
                         "item_id": question_item.id
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
                            "questionType": "random",
                            "answers": []
                        }
                    )
                question_count += 1
            template_sub["sections"].append(pom_section)
            template_sub["number_of_questions"] = question_count

        student_quizzes = Quiz.query.filter(
            Quiz.student_id == 3,
            Quiz.quiz_template_id == template.id
        ).order_by(desc(Quiz.date_time_finished)).first()
        print("AAAA",student_quizzes)

        if student_quizzes is not None:
            template_sub["quiz_id"] = student_quizzes.id
            # student_quizzes.date_time_finished is None or
            time_end = student_quizzes.date_time_started + datetime.timedelta(minutes=template.time_to_finish)
            if datetime.datetime.now() <= time_end and student_quizzes.date_time_finished is None:
                template_sub["is_finished"] = False
            else:
                template_sub["is_finished"] = True
                student_quizzes.date_time_finished = time_end
                db.session.commit()
        else:
            template_sub["is_finished"] = True
            template_sub["first_generation"] = True

        result.append(template_sub)

    return {"result": result}, 200


@app.route("/api/quiz-finish", methods=["PUT"])
def quiz_finish():
    data = request.get_json()

    student_quizzes = Quiz.query.filter(
        Quiz.student_id == data["student_id"],
        Quiz.quiz_template_id == data["quiz_template_id"]
    ).order_by(desc(Quiz.date_time_finished)).first()

    if student_quizzes is not None:
        student_quizzes.date_time_finished = datetime.datetime.now(pytz.utc)
        db.session.add(student_quizzes)
        db.session.commit()

    return {"finished": True}


@app.route("/api/archive-quiz", methods=["PUT"])
def archive_quiz():
    quiz_template_id = request.get_json()["quiz_template_id"]

    archive_quiz_template = QuizTemplate.query.filter_by(id=quiz_template_id).first()
    archive_quiz_template.is_deleted = True
    db.session.commit()

    return {}


@app.route("/api/new-quiz-template-check", methods=["POST"])
def check_new_quiz_template():
    student_quizzes = []
    try:
        f_data = request.get_json()
        data = f_data["sections"]

        student_quizzes = Quiz.query.filter(
            Quiz.student_id == 3,
            Quiz.quiz_template_id == f_data["id"]
        ).all()

    except:
        data = request.get_json()

    # if len(student_quizzes) > 0:
    #     result = []
    #     for section in student_quizzes[0].quiz_sections:
    #         for item in section.quiz_items:
    #             result.append(item.question_version_id)
    #     return {"message": True, "result": result}

    questions_ids = []
    random_questions = []
    random_questions_dict = {}

    for section in data:
        for question in section["questions"]:
            if question["questionType"] == "questions":
                questions_ids.append(question["id"])
            else:
                random_questions.append(question)

                cat_name = ""
                if question["includeSubCategories"]:
                    cat_name = " with Subcategories"

                if question["categoryName"] + cat_name in random_questions_dict:
                    random_questions_dict[question["categoryName"] + cat_name] += 1
                else:
                    random_questions_dict[question["categoryName"] + cat_name] = 1

    random_questions_ids = []
    for rand_question in random_questions:
        question_type = 0

        if rand_question["questionAnswerType"] == "Any Type":
            question_type = 1
        if rand_question["questionAnswerType"] == "Matching Question":
            question_type = 2
        if rand_question["questionAnswerType"] == "Short Question":
            question_type = 3
        if rand_question["questionAnswerType"] == "Multiple Choice":
            question_type = 4

        if rand_question["includeSubCategories"]:
            include_sub_cats = "true"
        else:
            include_sub_cats = "false"

        questions_to_select = get_questions_from_category_helper(include_sub_cats, question_type,
                                                                 rand_question["categoryId"])

        if rand_question["includeSubCategories"]:
            name = rand_question["categoryName"] + " with Subcategories"
        else:
            name = rand_question["categoryName"]

        if random_questions_dict[name] > len(questions_to_select):
            return {"message": False,
                    "error": f"category {name} doesnt have enought questions. Needed: {random_questions_dict[name]} but has only {len(questions_to_select)} questions"}

        questions_random_ids = [i["id"] for i in questions_to_select]

        from random import shuffle

        for question_id in questions_ids:
            if question_id in questions_random_ids:
                questions_random_ids.remove(question_id)

        shuffle(questions_random_ids)
        random_questions_ids.append(questions_random_ids)

    def backtrack(index, selected, used, lists, results):
        # print(index, selected, used, lists, results)
        if index == len(lists):
            results.append(selected[:])
            return True

        for num in lists[index]:
            if num not in used:
                selected.append(num)
                used.add(num)

                if backtrack(index + 1, selected, used, lists, results):
                    return True

                selected.pop()
                used.remove(num)

        return False

    result = []
    backtrack(0, [], set(), random_questions_ids, result)

    if len(result) == 0:
        return {"message": False, "error": "Quiz cannot be generated"}
    else:
        return {"message": True, "result": result,
                "number_of_questions": len(questions_ids) + len(random_questions_ids)}


@app.route("/api/questions-quiz/<int:index>", methods=["GET"])
def get_questions_quiz(index):
    review = request.args.get("review")
    item_id = request.args.get('item_id')
    feedback_type = request.args.get('feedbackType')
    print(item_id)

    item = QuizItem.query.filter_by(id=item_id).first()


    if review == "false":
        review = False
    else:
        review = True

    question = Question.query.get_or_404(index)
    newest_version = None
    for i in question.question_version:
        if newest_version is None:
            newest_version = i
        elif i.dateCreated > newest_version.dateCreated:
            newest_version = i

    answers = []
    is_correct_res = True
    points = 0
    max_points = 0

    if newest_version.type == "matching_answer_question":
        if item is not None:
            matching_answs = json.loads(item.answer)

            if len(matching_answs) != 0:
                cnt = 0

                for matching_pair in newest_version.matching_question:
                    if review:
                        if len(matching_answs) != 0:
                            max_points = matching_answs["evaluate"]
                        else:
                            max_points = 0

                        if matching_pair.rightSide == matching_answs["answer"][cnt][
                            "answer"] and is_correct_res == True:
                            is_correct_res = True
                            points = matching_answs["evaluate"]
                        else:
                            is_correct_res = False
                            points = 0

                    answers.append(
                        {"leftSide": matching_pair.leftSide, "pairId": matching_pair.id,
                         "rightSide": matching_pair.rightSide, "answer": matching_answs["answer"][cnt]["answer"]})
                    cnt += 1
            else:
                for matching_pair in newest_version.matching_question:
                    answers.append(
                        {"leftSide": matching_pair.leftSide, "rightSide": matching_pair.rightSide, "answer": []})
        else:
            for matching_pair in newest_version.matching_question:
                answers.append({"leftSide": matching_pair.leftSide, "rightSide": matching_pair.rightSide, "answer": []})


    elif newest_version.type == "multiple_answer_question":
        multiple_answs = []
        if item is not None:
            multiple_answs = json.loads(item.answer)

        cnt = 0

        for choice in newest_version.multiple_answers:
            try:
                if multiple_answs["answer"][cnt][2] == "True":
                    res = True
                else:
                    res = False
            except:
                res = False

            if review:
                if len(multiple_answs) != 0:
                    max_points = multiple_answs["evaluate"]

                    if res == choice.is_correct and is_correct_res:
                        is_correct_res = True
                        points = max_points
                    else:
                        is_correct_res = False
                        points = 0

                else:
                    points = 0
                    max_points = 0

            answers.append(
                {
                    "choiceId": choice.id,
                    "text": choice.text,
                    "isSingle": choice.is_single,
                    "answer": res
                }
            )
            cnt += 1
    else:
        if item is not None:
            item_answer = json.loads(item.answer)

            if review:
                if len(item_answer) != 0:
                    max_points = item_answer["evaluate"]
                    if newest_version.short_answers[0].text == item_answer["answer"]:
                        is_correct_res = True
                        points = max_points
                    else:
                        is_correct_res = False
                        points = 0

                else:
                    points = 0
                    max_points = 0

            answers.append(
                {"answer": item_answer["answer"]}
            )
        else:
            answers.append(
                {"answer": ""}
            )

    feedback = ""
    if not is_correct_res:
        feedback = newest_version.questions.question_feedback

    return {
        "id": newest_version.id,
        "question_id": newest_version.question_id,
        "title": newest_version.title,
        "text": newest_version.text,
        "type": newest_version.type,
        "answers": answers,
        "isCorrect": is_correct_res,
        "points": points,
        "max_points": max_points,
        "feedback": feedback
    }


@app.route("/api/new-quiz-template", methods=["PUT"])
def create_new_quiz_template():
    data = request.get_json()

    if data["quizId"] != 0:
        quiz_template = QuizTemplate.query.filter_by(id=data["quizId"]).first()
        quiz = Quiz.query.filter_by(quiz_template_id=data["quizId"]).all()

        for i in quiz:
            db.session.delete(i)
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
        datetime_check=data["dateCheck"],
        feedback_type=data["feedbackType"]
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
                question_item = QuizTemplateItem(
                    question_id=question["id"],
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


@app.route("/api/new-quiz-student", methods=["PUT"])
def new_quiz_student():
    data = request.get_json()
    quiz = data["quiz"]
    questions = data["questions"]
    student_id = data["student_id"]
    refresh_quiz = data["refreshQuiz"]

    student_quizzes = Quiz.query.filter(
        Quiz.student_id == student_id,
        Quiz.quiz_template_id == quiz["id"]
    ).order_by(desc(Quiz.date_time_started)).all()
    print(student_quizzes)
    if len(student_quizzes) >= 1:
        print(student_quizzes[0].date_time_started + datetime.timedelta(minutes=int(QuizTemplate.query.filter(QuizTemplate.id == quiz["id"]).first().time_to_finish)) > datetime.datetime.now())
        if student_quizzes[0].date_time_started + datetime.timedelta(minutes=int(QuizTemplate.query.filter(QuizTemplate.id == quiz["id"]).first().time_to_finish)) > datetime.datetime.now() and student_quizzes[0].date_time_finished ==None:
            return {"created": False, "quiz_id": student_quizzes[0].id}

    time_now = datetime.datetime.now()
    new_quiz = Quiz(
        date_time_started=time_now,
        quiz_template_id=quiz["id"],
        student_id=student_id
    )

    time_to_finish = db.session.query(QuizTemplate.time_to_finish).filter(
        QuizTemplate.id == quiz["id"]).first().time_to_finish

    db.session.add(new_quiz)
    db.session.commit()

    order_sections = []
    for section in quiz["sections"]:
        section_added = QuizSection(
            quiz_id=new_quiz.id
        )

        db.session.add(section_added)
        db.session.commit()
        order_sections.append(section_added.id)

        order_questions = []
        for question in section["questions"]:
            new_item = QuizItem(
                answer=json.dumps({"evaluate": question["evaluation"]}),
                score=question["evaluation"],
                question_version_id=questions[str(question["id"])]["id"],
                quiz_section_id=section_added.id
            )

            db.session.add(new_item)
            db.session.commit()

            order_questions.append(new_item.id)

        section_added.order = order_questions
        new_quiz.order = order_sections
        db.session.commit()

    return {"created": True, "time_to_finish": time_to_finish}


@app.route("/api/quiz-student-load", methods=["GET"])
def get_quiz_student_load():
    student_id = request.args.get('student_id')
    quiz_id = request.args.get('quiz_id')

    quiz = Quiz.query.filter(
        Quiz.student_id == int(student_id),
        Quiz.id == int(quiz_id)
    ).order_by(desc(Quiz.date_time_finished)).first()

    if quiz is None:
        quiz = Quiz.query.filter(
            Quiz.student_id == int(student_id),
            Quiz.id == Quiz.query.filter(Quiz.quiz_template_id == int(quiz_id)).order_by(desc(Quiz.date_time_finished)).first().id
        ).order_by(desc(Quiz.date_time_finished)).first()

        quiz_id = int(Quiz.query.filter(Quiz.quiz_template_id == int(quiz_id)).order_by(desc(Quiz.date_time_finished)).first().id)

    result = {"sections": [], "start_time": quiz.date_time_started,
              "minutes_to_finish": quiz.quiz_template.time_to_finish,
              "end_time": quiz.date_time_finished, "now_check": datetime.datetime.now()}

    quiz_templates = Quiz.query.filter(Quiz.id == int(quiz_id)).order_by(desc(Quiz.date_time_finished)).first()
    quiz_templates_id = quiz_templates.quiz_template_id
    quiz_temp = QuizTemplate.query.filter(QuizTemplate.id == int(quiz_templates_id)).first()
    section_titles = []
    for i in quiz_temp.quiz_template_section:
        section_titles.append(i.title)
    cnt = 0
    for section in quiz.order:
        add_section = {"questions": [], "title": ""}

        for item_id in QuizSection.query.filter(QuizSection.id == int(section)).first().order:
            item = QuizItem.query.filter(QuizItem.id == int(item_id)).first()
            add_section["questions"].append(
                {
                    "id": item.question_version.question_id,
                    "questionType": "questions",
                    "answers": item.answer,
                    "item_id": item.id
                }
            )

            add_section["title"] = section_titles[cnt]

        result["sections"].append(add_section)
        cnt += 1

    return result


@app.route("/api/quiz_set_answers", methods=["PUT"])
def update_quiz_answers():
    data = request.get_json()
    quiz_data = data["quiz"]
    question_data = data["data"]
    final_save = data["finalSave"]

    quiz = Quiz.query.filter(Quiz.quiz_template_id == quiz_data["id"], Quiz.student_id == 3).order_by(desc(Quiz.date_time_finished)).first()
    print(quiz)
    for section in quiz.quiz_sections:
        for item in section.quiz_items:
            ans = question_data[str(item.question_version.question_id)]
            if ans["type"] == "short_answer_question":
                load_answer = json.loads(item.answer)
                load_answer["answer"] = ans["answers"][0]["answer"]

                item.answer = json.dumps(load_answer)
                db.session.add(item)
                db.session.commit()

            if ans["type"] == "multiple_answer_question":
                load_answer = json.loads(item.answer)
                load_answer["answer"] = [
                    (indexQ, i["choiceId"], "True") if i["answer"] else (indexQ, i["choiceId"], "False") for indexQ, i
                    in enumerate(ans["answers"])]
                load_answer["question_version_id"] = item.question_version.id

                item.answer = json.dumps(load_answer)
                db.session.add(item)
                db.session.commit()

            if ans["type"] == "matching_answer_question":
                load_answer = json.loads(item.answer)
                answs = []
                for indexQ, i in enumerate(ans["answers"]):
                    i["indexQ"] = indexQ
                    answs.append(i)

                load_answer["answer"] = answs
                item.answer = json.dumps(load_answer)
                db.session.add(item)
                db.session.commit()

    if final_save:
        current_time = datetime.datetime.now(pytz.utc)
        print("-------")
        print(current_time)
        print(quiz)
        print("--------")
        quiz.date_time_finished = current_time
        db.session.add(quiz)
        db.session.commit()

    return {}


if __name__ == '__main__':
    with app.app_context():
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
