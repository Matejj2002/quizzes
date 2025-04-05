import json
from flask import Flask, session, jsonify, request, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from api.api_functions import *
from flask_session import Session
import requests
from dotenv import load_dotenv
from sqlalchemy import desc
import os
import psycopg2
from psycopg2 import sql
import re

load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
migrate = Migrate(app, db)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(24)
app.debug = False

if os.environ.get("IS_DOCKER") == 'true':
    print("Opened in docker")
    DB_HOST = "bakalarka-postgres-1"
    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@bakalarka-postgres-1:5432/quizzes"
else:
    print("Opened in localhost")
    DB_HOST = "localhost"
    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/quizzes"

app.config['SQLALCHEMY_ECHO'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = not app.debug
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

db.init_app(app)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/getAccessToken', methods=['GET'])
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


@app.route('/api/getUserData', methods=['GET'])
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
            user = User.query.filter(User.github_name == data["login"])

            if user.first() is None:
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
                role = user.first().user_type
                id_user = user.first().id

        data["role"] = role
        data["id_user"] = id_user
        data["error"] = "no error"

        return jsonify(data)
    else:
        return jsonify({"error": "Failed to retrieve user data"})


@app.route('/api/logout', methods=['POST'])
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
            comments = []

            for i in Comment.query.filter(Comment.question_version_id == question["versions"]["id"]).all():
                user = User.query.filter(User.id == i.author_id).first()
                if user is not None:
                    comments.append({
                        "text": i.text,
                        "author": user.github_name
                    })


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
                    "versions": versions,
                    "comments": comments
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
    teachers = User.query.filter(User.user_type == 'teacher').all()

    all_teachers = []
    for i in teachers:
        teacher_dict = {
            "name": i.github_name,
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
    author_id = data['author']
    feedback = data["feedback"]
    positive_feedback = data["positiveFeedback"]

    question = Question(category_id=category_id,
                        question_feedback=feedback,
                        question_positive_feedback=positive_feedback
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
                                     author_id=author_id,
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
        "question_positive_feedback": question.question_positive_feedback,
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
    question.question_positive_feedback = data["positiveFeedback"]
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


def evaluate_quiz(quiz):
    achieved_points = 0
    max_points = 0
    for section in quiz.quiz_sections:
        for item in section.quiz_items:
            question_version = item.question_version
            answer = json.loads(item.answer)

            try:
                answer["answer"]
            except:
                return

            if question_version.type == 'short_answer_question':
                if question_version.short_answers[0].is_regex:
                    if re.match(question_version.short_answers[0].text, answer["answer"]):
                        item.score = answer["evaluate"]
                        achieved_points += int(answer["evaluate"])
                        db.session.add(item)
                        db.session.commit()
                    else:
                        item.score = 0
                        db.session.add(item)
                        db.session.commit()

                else:
                    if answer["answer"] == question_version.short_answers[0].text:
                        item.score = answer["evaluate"]
                        achieved_points += int(answer["evaluate"])
                        db.session.add(item)
                        db.session.commit()
                    else:
                        item.score = 0
                        db.session.add(item)
                        db.session.commit()

            if question_version.type == "multiple_answer_question":
                full_answer_correct = True
                for i in answer["answer"]:
                    choice = Choice.query.filter_by(id=i[1]).first()

                    if i[2] == 'True':
                        hodn = True
                    else:
                        hodn = False

                    if not choice.is_correct == hodn:
                        full_answer_correct = False

                if full_answer_correct:
                    item.score = answer["evaluate"]
                    achieved_points += int(answer["evaluate"])
                    db.session.add(item)
                    db.session.commit()
                else:
                    item.score = 0
                    db.session.add(item)
                    db.session.commit()

            if question_version.type == "matching_answer_question":
                full_answer_correct = True
                for i in answer["answer"]:
                    rs = MatchingPair.query.filter(MatchingPair.id == i["pairId"]).first().rightSide
                    if not i["answer"] == rs:
                        full_answer_correct = False

                if full_answer_correct:
                    item.score = answer["evaluate"]
                    achieved_points += int(answer["evaluate"])
                    db.session.add(item)
                    db.session.commit()
                else:
                    item.score = 0
                    db.session.add(item)
                    db.session.commit()

            max_points += int(answer["evaluate"])

    quiz.max_points = max_points
    quiz.achieved_points = achieved_points
    db.session.add(quiz)
    db.session.commit()

def get_quiz_template(student_id, quiz_template_id, actual_time = datetime.datetime.now(), cnt = 0, update_at = ""):
    template = QuizTemplate.query.filter(QuizTemplate.id == quiz_template_id).first()

    if template.is_deleted:
        return None

    if template.date_time_open <= actual_time <= template.date_time_close:
        is_opened = True
    else:
        is_opened = False

    time_limit_end = False
    if actual_time > template.date_time_close:
        time_limit_end = True

    can_be_checked = False
    if actual_time >= template.datetime_check:
        can_be_checked = True

    if template.feedback_type == None:
        feedback_type = []
    else:
        feedback_type = template.feedback_type

    if template.feedback_type_after_close == None:
        feedback_type_after_close = []
    else:
        feedback_type_after_close = template.feedback_type_after_close

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
        "feedbackType": feedback_type,
        "feedbackTypeAfterClose": feedback_type_after_close,
        "quiz_id": 0,
        "sections": [],
        "quizzes": [],
        "is_opened": is_opened,
        "time_limit_end": time_limit_end,
        "can_be_checked": can_be_checked,
        "is_finished": False,
        "first_generation": False,
        "number_of_questions": 0,
        "actual_quiz": cnt == 0
    }
    cnt += 1

    question_count = 0
    section_count = 1
    for num in template.order:

        section = QuizTemplateSection.query.filter(QuizTemplateSection.id == num).first()

        pom_section = {
            "sectionId": section_count,
            "title": section.title,
            "shuffle": section.shuffle,
            "order": section.order,
            "questions": [],
            "section_id": section.id
        }
        section_count += 1

        for number in section.order:
            if section.order is not None:
                question_item = QuizTemplateItem.query.filter(QuizTemplateItem.id == number).first()
                question = question_item.question
            else:
                question_item = None
                question = None

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
                        "item_id": question_item.id,
                        "answers": []
                    }
                )
            question_count += 1
        template_sub["sections"].append(pom_section)
        template_sub["number_of_questions"] = question_count

    student_quizzes = Quiz.query.filter(
        Quiz.student_id == student_id,
        Quiz.quiz_template_id == template.id
    ).order_by(desc(Quiz.date_time_started)).all()

    if student_quizzes is not None and len(student_quizzes) > 0:
        template_sub["quiz_id"] = student_quizzes[0].id
        time_end = (student_quizzes[0].date_time_started + datetime.timedelta(minutes=template.time_to_finish))

        if actual_time < time_end and student_quizzes[0].date_time_finished is None:
            template_sub["is_finished"] = False

            if update_at == "":
                update_at = time_end
            elif time_end < update_at:
                update_at = time_end
        else:
            template_sub["is_finished"] = True
            if student_quizzes[0].date_time_finished is None:
                try:
                    evaluate_quiz(student_quizzes[0])
                except:
                    pass
                student_quizzes[0].date_time_finished = time_end
                db.session.commit()

        quizzes = []
        for i in student_quizzes:
            quizzes.append({
                "quiz_id": i.id,
                "ended": i.date_time_finished,
                "feedback": feedback_type
            })

        try:
            quizzes.sort(key=lambda x: x["ended"])
        except:
            pass

        template_sub["quizzes"] = quizzes

    else:
        template_sub["is_finished"] = True
        template_sub["first_generation"] = True

    return template_sub

@app.route("/api/get-quiz-templates", methods=["GET"])
def get_quiz_templates():
    student_id = request.args.get("studentId")
    quiz_templates = QuizTemplate.query.all()

    result = []

    actual_time = datetime.datetime.now()

    cnt = 0

    update_at = ""

    for template in sorted(quiz_templates, key=lambda x: x.date_time_open, reverse=True):
        template_sub = get_quiz_template(student_id, template.id, actual_time, cnt, update_at)

        if template_sub is not None:
            result.append(template_sub)

    return {"result": result, "update_at": update_at}, 200


@app.route("/api/quiz-finish", methods=["PUT"])
def quiz_finish():
    data = request.get_json()

    student_quizzes = Quiz.query.filter(
        Quiz.student_id == data["student_id"],
        Quiz.quiz_template_id == data["quiz_template_id"]
    ).order_by(desc(Quiz.date_time_started)).first()

    if student_quizzes is not None:
        student_quizzes.date_time_finished = datetime.datetime.now()
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
    print("---START---")
    try:
        f_data = request.get_json()
        data = f_data["sections"]
    except:
        data = request.get_json()

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

@app.route("/api/quiz_change_evaluation", methods=["PUT"])
def quiz_change_evaluation():
    data_pom = request.get_json()
    data = data_pom["questionsData"]

    id_quiz =  data_pom["id"]

    quiz = Quiz.query.get(id_quiz)

    sum_points = 0
    for i in data:
        item_id = data[i]["item_id"]
        points = data[i]["points"]

        quiz_item = QuizItem.query.get(item_id)
        quiz_item.score = points
        db.session.add(quiz_item)
        db.session.commit()

        sum_points+= float(points)

    quiz.achieved_points = sum_points
    db.session.commit()

    return {},200

@app.route("/api/questions-quiz/<int:index>", methods=["GET"])
def get_questions_quiz(index):
    review = request.args.get("review")
    item_id = request.args.get('item_id')
    quiz_id = request.args.get("quiz_id")

    item = QuizItem.query.filter_by(id=item_id).first()

    if review == "false":
        review = False
    else:
        qz = QuizTemplate.query.filter(QuizTemplate.id == quiz_id).first()
        if datetime.datetime.now() > qz.date_time_close:
            feedback_type = qz.feedback_type_after_close
        else:
            feedback_type = qz.feedback_type
        review = True

    question = Question.query.get_or_404(index)
    newest_version = None
    if item is not None:
        newest_version = item.question_version
    else:
        for i in question.question_version:
            if newest_version is None:
                newest_version = i
            elif i.dateCreated > newest_version.dateCreated:
                newest_version = i

    answers = []
    is_correct_res = True
    points = 0
    max_points = 0
    correct_answers = ""

    if newest_version.type == "matching_answer_question":
        if item is not None:
            matching_answs = json.loads(item.answer)
            correct_answers = "\n"

            right_sides = [i.rightSide for i in newest_version.matching_question]
            from random import shuffle
            shuffle(right_sides)

            if len(matching_answs) != 0:
                cnt = 0
                for matching_pair in newest_version.matching_question:
                    correct_answers += matching_pair.leftSide + " -> " + matching_pair.rightSide + "\n"

                    if review:
                        max_points = item.max_points
                        points = item.score
                        if points != 0:
                            is_correct_res = True
                        else:
                            is_correct_res = False

                        answers.append(
                            {"leftSide": matching_pair.leftSide,
                             "pairId": matching_pair.id,
                             "rightSide": matching_pair.rightSide if "correctAnswers" in feedback_type else None,
                             "answer": matching_answs["answer"][cnt]["answer"],
                             "feedback": matching_pair.negative_feedback if "optionsFeedback" in feedback_type else None,
                             })

                    else:
                        answers.append(
                            {"leftSide": matching_pair.leftSide, "pairId": matching_pair.id,
                             "answer": matching_answs["answer"][cnt]["answer"],
                             "showRightSide": right_sides[cnt]
                             })
                    cnt += 1
        else:
            for matching_pair in newest_version.matching_question:
                answers.append({"leftSide": matching_pair.leftSide, "answer": [],
                                })

    elif newest_version.type == "multiple_answer_question":
        multiple_answs = []
        ord_ids = []
        if item is not None:
            multiple_answs = json.loads(item.answer)

            if item.order is None:
                from random import shuffle
                ord_ids = [i.id for i in newest_version.multiple_answers]
                shuffle(ord_ids)
                item.order = ord_ids
                db.session.commit()
            else:
                ord_ids = item.order

        cnt = 0
        correct_answers += "\n"

        for choice_id in ord_ids:
            choice = Choice.query.filter(Choice.id == choice_id).first()
            correct_answers += str(choice.is_correct) + "\n"
            try:
                if multiple_answs["answer"][cnt][2] == "True":
                    res = True
                else:
                    res = False
            except:
                res = False

            if review:
                max_points = item.max_points
                points = item.score
                if points != 0:
                    is_correct_res = True
                else:
                    is_correct_res = False

                answers.append(
                    {
                        "choiceId": choice.id,
                        "text": choice.text,
                        "answer": res,
                        "feedback": choice.negative_feedback if "optionsFeedback" in feedback_type else None,
                        "isCorrectOption": res == choice.is_correct if "correctAnswers" in feedback_type else None
                    }
                )
            else:
                answers.append(
                    {
                        "choiceId": choice.id,
                        "text": choice.text,
                        "answer": res,
                    }
                )
            cnt += 1

    else:
        if item is not None:
            item_answer = json.loads(item.answer)

            correct_answers = newest_version.short_answers[0].text
            if review:
                max_points = item.max_points
                points = item.score
                if points != 0:
                    is_correct_res = True
                else:
                    is_correct_res = False

                answers.append(
                    {"answer": item_answer["answer"],
                     "feedback": newest_version.short_answers[
                         0].negative_feedback if "optionsFeedback" in feedback_type else None
                     }
                )

            else:
                answers.append(
                    {"answer": item_answer["answer"]}
                )
        else:
            answers.append(
                {"answer": ""}
            )

    if not is_correct_res:
        feedback = newest_version.questions.question_feedback
    else:
        feedback = newest_version.questions.question_positive_feedback

    if review:
        return {
            "id": newest_version.id,
            "question_id": newest_version.question_id,
            "title": newest_version.title,
            "text": newest_version.text,
            "type": newest_version.type,
            "answers": answers,
            "isCorrect": is_correct_res if "correctAnswers" in feedback_type or "pointsReview" in feedback_type else None,
            "points": points if "pointsReview" in feedback_type else None,
            "max_points": max_points if "pointsReview" in feedback_type else None,
            "feedback": feedback if "questionFeedback" in feedback_type else None,
            "correct_answer": correct_answers if "correctAnswers" in feedback_type else None,
            "item_id": int(item_id)
        }
    else:
        return {
            "id": newest_version.id,
            "question_id": newest_version.question_id,
            "title": newest_version.title,
            "text": newest_version.text,
            "type": newest_version.type,
            "answers": answers,
        }


@app.route("/api/get-users", methods=["GET"])
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

    user_table.sort(key=lambda x: x[sort], reverse=sort_dir == "asc")
    return {"result": user_table}, 200


@app.route("/api/get-quizzes-analysis", methods=["GET"])
def get_all_quizzes_analysis():
    filter = request.args.get("filterName")

    quiz_templates = QuizTemplate.query.filter(QuizTemplate.is_deleted == False).all()

    students = User.query.filter(User.user_type == 'student').all()

    quiz_data = []
    for qt in quiz_templates:
        if qt.title.startswith(filter):
            data = {
                "title": qt.title,
                "attendance": 0,
                "number_of_students": len(students)
            }

            attendance = 0
            for student in students:
                quiz_student = Quiz.query.filter(Quiz.quiz_template_id == qt.id, Quiz.student_id == student.id).all()
                if len(quiz_student) > 0:
                    attendance += 1

            data["attendance"] = attendance
            quiz_data.append(data)
    return {"result": quiz_data}


@app.route("/api/get-user-data", methods=["GET"])
def get_user_data_statistics():
    student_id = request.args.get("studentId")

    quizzes = Quiz.query.filter_by(student_id=student_id).all()
    quizzes_templates_student = set()
    for i in quizzes:
        if i.quiz_template.is_deleted == False:
            quizzes_templates_student.add(i.quiz_template.id)

    quizzes_templates_all = QuizTemplate.query.filter_by(is_deleted=False).all()

    user = User.query.filter_by(id=student_id).first()

    quiz_templates_student = []

    all_max_points = 0
    all_achieved_points = 0

    for i in quizzes_templates_student:
        j = Quiz.query.filter_by(quiz_template_id=i).order_by(desc(Quiz.date_time_started)).first()
        max_points = j.max_points
        achieved_points = j.achieved_points

        if achieved_points is not None:
            all_achieved_points += achieved_points
            all_max_points += max_points

        template = QuizTemplate.query.filter_by(id=i).first()
        attempts = Quiz.query.filter_by(quiz_template_id=template.id, student_id=student_id).count()
        quiz_templates_student.append({
            "id": template.id,
            "title": template.title,
            "attempts": attempts,
            "max_points": max_points,
            "achieved": achieved_points,
            "quizzes": get_quiz_template(student_id, template.id)

        })

    try:
        percentage = round(all_achieved_points / all_max_points, 2) * 100
    except:
        percentage = 0

    return {"result": {
        "user_type": user.user_type.capitalize(),
        "github_name": user.github_name,
        "quizzes_attended": quiz_templates_student,
        "all_quizzes": len(quizzes_templates_all),
        "all_achieved_points": all_achieved_points,
        "all_max_points": all_max_points,
        "percentage": percentage
    }}, 200


@app.route("/api/save-feedback-to-item", methods=["PUT"])
def save_feedback_to_item():
    data = request.get_json()
    item = QuizItem.query.filter(QuizItem.id == data["itemId"]).first()
    comment = Comment(
        author_id=data["student_id"],
        text=data["feedback"],
        date_created=datetime.datetime.now(),
        question_version_id=item.question_version_id
    )
    db.session.add(comment)
    db.session.commit()

    if data["role"] == "student":
        item.students_comment_id = comment.id
    else:
        item.teachers_comment_id = comment.id
    db.session.commit()

    return {}, 200


@app.route("/api/create-teacher", methods=["PUT"])
def create_teacher():
    data = request.get_json()

    new_teacher = User(name=data["name"], github_name=data["githubName"], user_type="teacher")
    db.session.add(new_teacher)
    db.session.commit()

    return {}, 200


@app.route("/api/change-user-type", methods=["PUT"])
def change_user_type():
    data = request.get_json()

    user = User.query.filter(User.id == data["userId"]).first()

    user.user_type = data["selectedType"].lower()
    db.session.add(user)
    db.session.commit()

    return {}, 200


@app.route("/api/new-quiz-template", methods=["PUT"])
def create_new_quiz_template():
    data = request.get_json()

    if data["changeData"]:
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
            date_time_open=data['dateOpen'],
            date_time_close=data['dateClose'],
            time_to_finish=data["minutesToFinish"],
            datetime_check=data['dateCheck'],
            feedback_type=data["feedbackType"],
            feedback_type_after_close=data["feedbackTypeAfterClose"]
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

    else:
        quiz_template = QuizTemplate.query.filter(QuizTemplate.id == data["quizId"]).first()
        quiz_template.title = data["quizTitle"]
        quiz_template.shuffle_sections = data["shuffleSections"]
        quiz_template.correction_of_attempts = data["typeOfAttempts"]
        quiz_template.number_of_corrections = data["numberOfCorrections"]
        quiz_template.date_time_open = data["dateOpen"]
        quiz_template.date_time_close = data["dateClose"]
        quiz_template.datetime_check = data["dateCheck"]
        quiz_template.feedback_type = data["feedbackType"]
        quiz_template.time_to_finish = data["minutesToFinish"]
        quiz_template.feedback_type_after_close = data["feedbackTypeAfterClose"]

        db.session.add(quiz_template)
        db.session.commit()

    return {}, 200


def generate_quiz(quiz, questions, student_id):
    time_now = datetime.datetime.now()
    from random import shuffle
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
                score=0,
                question_version_id=questions[str(question["id"])]["id"],
                quiz_section_id=section_added.id,
                max_points=0
            )

            if question["questionType"] == "questions":
                version = QuestionVersion.query.filter(
                    QuestionVersion.id == questions[str(question["id"])]["id"]).first()

                if question["type"] == "short_answer_question":
                    order_options = [version.short_answers[0].id]
                elif question["type"] == "multiple_answer_question":
                    mult_opts = [i.id for i in version.multiple_answers]
                    shuffle(mult_opts)
                    order_options = mult_opts

                else:
                    order_options = [i.id for i in version.matching_question]

            db.session.add(new_item)
            db.session.commit()

            if question["questionType"] == "questions":
                new_item.order = order_options
                db.session.add(new_item)
                db.session.commit()

            order_questions.append(new_item.id)

        if quiz["shuffle_sections"]:
            shuffle(order_sections)

        if section["shuffle"]:
            shuffle(order_questions)

        section_added.order = order_questions
        new_quiz.order = order_sections
        db.session.commit()

    return time_to_finish


@app.route("/api/new-quiz-student", methods=["PUT"])
def new_quiz_student():
    data = request.get_json()
    quiz = data["quiz"]
    questions = data["questions"]
    student_id = data["student_id"]

    student_quizzes = Quiz.query.filter(
        Quiz.student_id == student_id,
        Quiz.quiz_template_id == quiz["id"]
    ).order_by(desc(Quiz.date_time_started)).all()

    if len(student_quizzes) >= 1:
        act_quiz = student_quizzes[0]
        if act_quiz.date_time_finished is None:
            return {"created": False, "quiz_id": act_quiz.id}

    if quiz["correction_of_attempts"] == "indepedentAttempts":
        time_to_finish = generate_quiz(quiz, questions, student_id)

    else:
        if len(student_quizzes) == 0:
            time_to_finish = generate_quiz(quiz, questions, student_id)

        else:
            act_quiz = student_quizzes[0]

            new_quiz = Quiz(
                date_time_started=datetime.datetime.now(),
                quiz_template_id=act_quiz.quiz_template_id,
                student_id=act_quiz.student_id
            )

            time_to_finish = db.session.query(QuizTemplate.time_to_finish).filter(
                QuizTemplate.id == quiz["id"]).first().time_to_finish

            db.session.add(new_quiz)
            db.session.commit()

            order_sections = []
            for sect in act_quiz.order:
                i = QuizSection.query.filter_by(id=sect).first()

                new_section = QuizSection(
                    quiz_id=new_quiz.id
                )
                db.session.add(new_section)
                db.session.commit()
                order_sections.append(new_section.id)

                order_questions = []
                for j in i.order:
                    quiz_item = QuizItem.query.filter(QuizItem.id == j).first()
                    new_item = QuizItem(
                        answer=quiz_item.answer,
                        score=quiz_item.score,
                        question_version_id=quiz_item.question_version_id,
                        quiz_section_id=new_section.id,
                        order=quiz_item.order,
                        max_points=0
                    )

                    db.session.add(new_item)
                    db.session.commit()
                    order_questions.append(new_item.id)

                new_section.order = order_questions
                new_quiz.order = order_sections
                db.session.commit()

            return {"created": False, "time_to_finish": time_to_finish, "quiz_id": new_quiz.id}

    return {"created": True, "time_to_finish": time_to_finish}


@app.route("/api/quiz-student-load", methods=["GET"])
def get_quiz_student_load():
    student_id = request.args.get('student_id')
    quiz_id = request.args.get('quiz_id')

    quiz = Quiz.query.filter(
        Quiz.student_id == int(student_id),
        Quiz.id == int(quiz_id)
    ).order_by(desc(Quiz.date_time_started)).first()

    if quiz is None:
        quiz = Quiz.query.filter(
            Quiz.student_id == int(student_id),
            Quiz.id == Quiz.query.filter(Quiz.quiz_template_id == int(quiz_id),
                                         Quiz.student_id == int(student_id)).order_by(
                desc(Quiz.date_time_started)).first().id
        ).order_by(desc(Quiz.date_time_started)).first()

        quiz_id = int(
            Quiz.query.filter(Quiz.quiz_template_id == int(quiz_id)).order_by(desc(Quiz.date_time_started)).first().id)

    result = {"sections": [], "start_time": quiz.date_time_started,
              "minutes_to_finish": quiz.quiz_template.time_to_finish,
              "end_time": quiz.date_time_finished, "now_check": datetime.datetime.now()}

    quiz_templates = Quiz.query.filter(Quiz.id == int(quiz_id)).order_by(desc(Quiz.date_time_started)).first()
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


@app.route("/api/get-results-students", methods=["GET"])
def get_students_results():
    students = User.query.all()

    quiz_templates = [i for i in QuizTemplate.query.all() if not i.is_deleted]

    titles = "name,"
    for i in quiz_templates[:-1]:
        titles += i.title + ","

    titles += quiz_templates[-1].title + "sum_points" + "\n"

    data = ""
    cnt = 1
    for student in students:
        data += f"{student.github_name},"
        sum_points = 0
        for qt in quiz_templates:
            quizzes = Quiz.query.filter(Quiz.student_id == student.id, Quiz.quiz_template_id == qt.id).all()
            if len(quizzes) > 0:
                quizzes.sort(key=lambda x: x.date_time_started, reverse=True)
                act_quiz = quizzes[0]
                if act_quiz.achieved_points is None:
                    data += "0,"
                else:
                    data += f"{act_quiz.achieved_points},"
                    sum_points += float(act_quiz.achieved_points)
            else:
                data += "0,"

        cnt += 1
        data += f"{sum_points}\n"

    return {"result": titles + data}, 200


@app.route("/api/quiz_set_answers", methods=["PUT"])
def update_quiz_answers():
    data = request.get_json()
    quiz_data = data["quiz"]
    question_data = data["data"]
    final_save = data["finalSave"]
    student_id = data["studentId"]

    quiz = Quiz.query.filter(Quiz.quiz_template_id == quiz_data["id"], Quiz.student_id == student_id).order_by(
        desc(Quiz.date_time_started)).first()

    for section in quiz.quiz_sections:
        for item in section.quiz_items:
            try:
                ans = question_data[str(item.question_version.question_id)]
            except:
                return {}

            if ans["type"] == "short_answer_question":
                load_answer = json.loads(item.answer)

                load_answer["answer"] = ans["answers"][0]["answer"]

                item.answer = json.dumps(load_answer)
                item.max_points = load_answer["evaluate"]
                db.session.add(item)
                db.session.commit()

            if ans["type"] == "multiple_answer_question":
                load_answer = json.loads(item.answer)

                load_answer["answer"] = [
                    (indexQ, i["choiceId"], "True") if i["answer"] else (indexQ, i["choiceId"], "False") for indexQ, i
                    in enumerate(ans["answers"])]
                load_answer["question_version_id"] = item.question_version.id

                item.answer = json.dumps(load_answer)
                item.max_points = load_answer["evaluate"]
                db.session.add(item)
                db.session.commit()

            if ans["type"] == "matching_answer_question":
                load_answer = json.loads(item.answer)
                answs = []
                for indexQ, i in enumerate(ans["answers"]):
                    i["indexQ"] = indexQ
                    if "answer" not in i:
                        i["answer"] = ""
                    answs.append(i)

                load_answer["answer"] = answs
                item.answer = json.dumps(load_answer)
                item.max_points = load_answer["evaluate"]
                db.session.add(item)
                db.session.commit()

    if final_save:
        try:
            evaluate_quiz(quiz)
        except Exception as e:
            print(e)
            pass
        quiz.date_time_finished = datetime.datetime.now()
        db.session.add(quiz)
        db.session.commit()

    return {}

import subprocess

def check_database_exists():
    DB_NAME = "quizzes"
    DB_USER = "postgres"
    DB_PASSWORD = "postgres"
    DB_PORT = "5432"

    conn = psycopg2.connect(
        dbname="postgres", user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    conn.autocommit = True
    cursor = conn.cursor()

    cursor.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), [DB_NAME])
    exists = cursor.fetchone()

    if exists:
        print(f"Database '{DB_NAME}' already existing")

        print("Migrating DB...")
        subprocess.run([".venv\\Scripts\\flask.exe", "db", "upgrade"], cwd="backend", check=True)
        subprocess.run([".venv\\Scripts\\flask.exe", "db", "migrate", "-m", "Auto migration"], cwd="backend",
                       check=True)

        print("DB migration done.")

    else:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
        from create_database import create_database
        create_database()
        subprocess.run([".venv\\Scripts\\flask.exe", "db", "init"], cwd="backend", check=True)
        print(f"Database '{DB_NAME}' was created")

    cursor.close()
    conn.close()


if __name__ == '__main__':
    check_database_exists()
    app.run(debug=True, host='0.0.0.0', port=5000)
