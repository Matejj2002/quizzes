from flask import Blueprint, request, jsonify
import requests
try:
    from backend.functions.api_functions import *
except:
    from functions.api_functions import *

API_URL = os.getenv('API_URL')
quiz_bp = Blueprint('quiz', __name__, url_prefix=API_URL)

@quiz_bp.route("/quiz-finish", methods=["PUT"])
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


@quiz_bp.route("/archive-quiz", methods=["PUT"])
def archive_quiz():
    quiz_template_id = request.get_json()["quiz_template_id"]

    archive_quiz_template = QuizTemplate.query.filter_by(id=quiz_template_id).first()
    archive_quiz_template.is_deleted = True
    db.session.commit()

    return {}

@quiz_bp.route("/save-feedback-to-item", methods=["PUT"])
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


@quiz_bp.route("/new-quiz-student", methods=["PUT"])
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
        time_to_finish, quiz_id = generate_quiz(quiz, questions, student_id)

    else:
        if len(student_quizzes) == 0:
            time_to_finish, quiz_id = generate_quiz(quiz, questions, student_id)

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
                        max_points=quiz_item.max_points,
                        quiz_template_item_id=quiz_item.quiz_template_item_id
                    )

                    db.session.add(new_item)
                    db.session.commit()
                    order_questions.append(new_item.id)

                new_section.order = order_questions
                new_quiz.order = order_sections
                db.session.commit()

            return {"created": False, "time_to_finish": time_to_finish, "quiz_id": new_quiz.id}

    return {"created": True, "time_to_finish": time_to_finish, "quiz_id":quiz_id}


@quiz_bp.route("/quiz-student-load", methods=["GET"])
def get_quiz_student_load():
    student_id = request.args.get('student_id')
    quiz_id = request.args.get('quiz_id')
    load_type = request.args.get("load_type")

    if load_type == "review":
        quiz = Quiz.query.filter(
            Quiz.student_id == int(student_id),
            Quiz.quiz_template_id == int(quiz_id)
        ).order_by(desc(Quiz.date_time_started)).first()

        quiz_id = quiz.id

    if load_type == "attempt":
        quiz = Quiz.query.filter(
            Quiz.student_id == int(student_id),
            Quiz.id == int(quiz_id)
        ).order_by(desc(Quiz.date_time_started)).first()

        quiz_id = quiz.id

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


@quiz_bp.route("/evaluate_all_quizzes", methods = ["GET"])
def evaluate_all_quizzes():
    users = User.query.all()
    quiz_templates = QuizTemplate.query.filter(QuizTemplate.is_deleted !=True).all()
    for i in users:
        for j in quiz_templates:
            quiz = Quiz.query.filter(Quiz.quiz_template_id == j.id, Quiz.student_id == i.id).order_by(
                desc(Quiz.date_time_started)).first()

            if quiz is None:
                continue

            if quiz.date_time_finished is None:
                if (quiz.date_time_started + datetime.timedelta(minutes=j.time_to_finish) < datetime.datetime.now()):
                    evaluate_quiz(quiz)

    return {},200

@quiz_bp.route("/quiz_set_answers", methods=["PUT"])
def update_quiz_answers():
    data = request.get_json()
    quiz_data = data["quiz"]
    question_data = data["data"]
    final_save = data["finalSave"]
    student_id = data["studentId"]
    print("QD",final_save, question_data)

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

@quiz_bp.route("/questions-quiz/<int:index>", methods=["GET"])
def get_questions_quiz(index):
    review = request.args.get("review")
    item_id = request.args.get('item_id')
    quiz_id = request.args.get("quiz_id")
    correct_mode = request.args.get("correctMode")

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

    if correct_mode:
        feedback_type = ["correctAnswers", "optionsFeedback", "pointsReview", "questionFeedback"]

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

            max_points = item.max_points

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
                             "negative_feedback": matching_pair.negative_feedback if "optionsFeedback" in feedback_type else None,
                             "positive_feedback": matching_pair.positive_feedback if "optionsFeedback" in feedback_type else None,
                             })

                    else:
                        try:
                            answers.append(
                                {"leftSide": matching_pair.leftSide, "pairId": matching_pair.id,
                                 "answer": matching_answs["answer"][cnt]["answer"],
                                 "showRightSide": right_sides[cnt]
                                 })
                        except Exception as e:
                            answers.append(
                                {"leftSide": matching_pair.leftSide, "pairId": matching_pair.id,
                                 "answer": "",
                                 "showRightSide": right_sides[cnt]
                                 })
                    cnt += 1
        else:
            for matching_pair in newest_version.matching_question:
                answers.append({"leftSide": matching_pair.leftSide, "answer": [],
                                "pairId": matching_pair.id
                                })

    elif newest_version.type == "multiple_answer_question":
        multiple_answs = []
        ord_ids = []
        if item is not None:
            multiple_answs = json.loads(item.answer)
            max_points = item.max_points

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
            print(Choice.query.filter(Choice.id == choice_id).all())
            correct_answers += str(choice.is_correct) + "\n"

            try:
                dct = {}
                for i in multiple_answs["answer"]:
                    dct[i[1]] = i[2]
                if dct[choice.id] == "True":
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
                        "negative_feedback": choice.negative_feedback if "optionsFeedback" in feedback_type else None,
                        "positive_feedback": choice.positive_feedback if "optionsFeedback" in feedback_type else None,
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
                if points == item.max_points:
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
                try:
                    answers.append(
                        {"answer": item_answer["answer"]}
                    )
                except Exception as e:
                    answers.append({"answer": ""})
        else:
            answers.append(
                {"answer": ""}
            )


    positive_feedback = newest_version.questions.question_positive_feedback
    negative_feedback = newest_version.questions.question_feedback

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
            "positive_feedback": positive_feedback if "questionFeedback" in feedback_type else None,
            "negative_feedback": negative_feedback if "questionFeedback" in feedback_type else None,
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

@quiz_bp.route("/quiz_change_evaluation", methods=["PUT"])
def quiz_change_evaluation():
    data_pom = request.get_json()
    data = data_pom["questionsData"]

    id_quiz = data_pom["id"]

    quiz = Quiz.query.get(id_quiz)

    sum_points = 0
    for i in data:
        item_id = data[i]["item_id"]
        points = data[i]["points"]

        quiz_item = QuizItem.query.get(item_id)
        quiz_item.score = points
        db.session.add(quiz_item)
        db.session.commit()

        sum_points += float(points)

    quiz.achieved_points = sum_points
    db.session.commit()

    return {}, 200

