from flask import Blueprint, request, jsonify
import datetime
try:
    from backend.api.api_functions import *
except:
    from api.api_functions import *

questions_bp = Blueprint('questions', __name__, url_prefix='/api/')

@questions_bp.route('/questions/', methods=['GET'])
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

@questions_bp.route('/questions/delete', methods=['PUT'])
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

#
@questions_bp.route('/questions-update/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question_data = fetch_question_data(question_id)
    return jsonify(question_data)

#
@questions_bp.route('/questions/<int:question_id>/versions', methods=['GET'])
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

@questions_bp.route('/questions/new-question', methods=['PUT'])
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

@questions_bp.route('/question-version-choice/<int:question_id>', methods=['GET'])
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

@questions_bp.route('/questions/categories/get-path-to-supercategory/<int:index>', methods=['GET'])
def get_path_to_supercategory(index):
    category = Category.query.get_or_404(index)

    super_cat = Category.query.get(category.supercategory_id)
    path = [[category.title, category.id]]
    while super_cat is not None:
        path.append([super_cat.title, super_cat.id])
        super_cat = Category.query.get(super_cat.supercategory_id)

    return jsonify(path), 200

@questions_bp.route('/questions/versions/<int:id>', methods=['PUT'])
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

@questions_bp.route("/api/get_questions_category/<int:index>", methods=["GET"])
def get_questions_from_category(index):
    subcat = request.args.get('includeSubCat')
    question_type = int(request.args.get("typeQuestionSelected"))

    questions_versions = get_questions_from_category_helper(subcat, question_type, index)

    return {"questions": questions_versions}
