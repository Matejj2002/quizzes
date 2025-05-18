from flask import Blueprint, request, jsonify
import requests
try:
    from backend.functions.api_functions import *
except:
    from functions.api_functions import *

API_URL = os.getenv('API_URL')
quiz_statistics_bp = Blueprint('quiz_statistics', __name__, url_prefix=API_URL)

@quiz_statistics_bp.route("/sort-matching-questions-statistics", methods=["POST"])
def sort_matching_questions_statistics():
    data = request.get_json()
    sort_d = data["sort"]
    to_sort = data["data"]
    cols_type = data["colsType"]

    for e, i in enumerate(sort_d):
        if sort_d[e] != "no":
            if cols_type[e] == "string":
                to_sort.sort(key=lambda x: x[e].lower(), reverse=sort_d[e] == "asc")
            if cols_type[e] == "int":
                to_sort.sort(key=lambda x: int(x[e]), reverse=sort_d[e] == "asc")

    return {"result": to_sort}, 200



@quiz_statistics_bp.route("/get-quizzes-analysis", methods=["GET"])
def get_all_quizzes_analysis():
    filter = request.args.get("filterName")

    quiz_templates = QuizTemplate.query.filter(QuizTemplate.is_deleted == False).all()

    #students = User.query.filter(User.user_type == 'student').all()
    students = User.query.all()

    quiz_data = []
    for qt in quiz_templates:
        if qt.title.startswith(filter):
            data = {
                "quiz_template_id": qt.id,
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


@quiz_statistics_bp.route("/get-user-data", methods=["GET"])
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
        j = Quiz.query.filter_by(quiz_template_id=i, student_id = student_id).order_by(desc(Quiz.date_time_started)).first()

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


@quiz_statistics_bp.route("/get-results-students", methods=["GET"])
def get_students_results():
    students = User.query.all()

    quiz_templates = [i for i in QuizTemplate.query.all() if not i.is_deleted]

    titles = "name,"
    for i in quiz_templates[:-1]:
        titles += i.title.replace(" ", "_") + ","

    titles += quiz_templates[-1].title.replace(" ", "_") + ",sum_points" + "\n"

    data = ""
    for student in students:
        print(student)
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

        data += f"{sum_points}\n"

    return {"result": titles + data}, 200


@quiz_statistics_bp.route("/quiz-statistics", methods=["GET"])
def quiz_statistics():
    template_id = request.args.get("template_id")

    template = get_quiz_template(0, template_id)[0]

    question_analysis = {}

    users = set([i.id for i in User.query.all()])


    student_correct = {}
    student_incorrect = {}
    wrong_answers_quiz = {}
    items = {}
    for user in users:
        qz = Quiz.query.filter(Quiz.quiz_template_id == template["id"], Quiz.student_id == user).order_by(desc(Quiz.date_time_started)).first()

        if qz is not None:
            for section in qz.quiz_sections:
                for item in section.quiz_items:
                    items[item.quiz_template_item_id] = item

                    if item.quiz_template_item_id not in student_correct:
                        student_correct[item.quiz_template_item_id] = []
                        student_incorrect[item.quiz_template_item_id] = []

                    if item.quiz_template_item_id in student_correct and item.score > 0:
                        student_correct[item.quiz_template_item_id].append([user, item.score])

                    else:
                        student_incorrect[item.quiz_template_item_id].append(user)
                        template_item = QuizTemplateItem.query.filter(QuizTemplateItem.id==item.quiz_template_item_id).first()

                        try:
                            question_version = template_item.question.question_version[-1]
                        except:
                            continue

                        answer = json.loads(item.answer)
                        if template_item.question_type == "questions":
                            if question_version.type == "short_answer_question":

                                if item.quiz_template_item_id not in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id] = []

                                if item.quiz_template_item_id in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id].append(answer["answer"])

                            elif question_version.type == "multiple_answer_question":
                                choices = {}
                                for choice in question_version.multiple_answers:
                                    choices[choice.id] = choice.is_correct

                                wrong_answers_question = {}
                                for answ in answer["answer"]:
                                    answer_user = eval(answ[2])
                                    if choices[answ[1]] != answer_user:
                                        if answ[1] not in wrong_answers_question:
                                            wrong_answers_question[answ[1]] = []

                                        if answ[1] in wrong_answers_question:
                                            wrong_answers_question[answ[1]] = {"correct": answer_user, "incorrect": choices[answ[1]]}

                                if item.quiz_template_item_id not in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id] = []

                                if item.quiz_template_item_id in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id].append(wrong_answers_question)

                            else:
                                matchings = {}
                                for matching in question_version.matching_question:
                                    matchings[matching.id] = {
                                        "left_side": matching.leftSide,
                                        "right_side": matching.rightSide
                                    }

                                wrong_answers_question = {}
                                for answ in answer["answer"]:
                                    pair = matchings[answ["pairId"]]

                                    if answ["pairId"] not in wrong_answers_question:
                                        wrong_answers_question[answ["pairId"]] = []

                                    if answ["pairId"] in wrong_answers_question:
                                        wrong_answers_question[answ["pairId"]] = {"correct": pair["right_side"], "incorrect": answ["answer"]}


                                if item.quiz_template_item_id not in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id] = []

                                if item.quiz_template_item_id in wrong_answers_quiz:
                                    wrong_answers_quiz[item.quiz_template_item_id].append(wrong_answers_question)

    attendance_question = {}
    for key in student_correct.keys():
        attendance = len(student_correct[key]) + len(student_incorrect[key])

        wrong_answs_pom = {}
        typeQ = "eQ"
        if key in wrong_answers_quiz:
            for a in wrong_answers_quiz[key]:
                if type(a) == str:
                    typeQ="sQ"
                    if a not in wrong_answs_pom:
                        wrong_answs_pom[a] = 1
                    else:
                        wrong_answs_pom[a]+=1
                else:
                    typeQ = "lQ"
                    for key1, val in a.items():
                        if key1 not in wrong_answs_pom:
                            wrong_answs_pom[key1] = [val["correct"], val["incorrect"], 0]

                        if key1 in wrong_answs_pom:
                            wrong_answs_pom[key1][2]+=1

        wrong_answers_show=[]
        if typeQ == "eQ":
            wrong_answers_show = []

        elif typeQ == "sQ":
            for k, v in wrong_answs_pom.items():
                wrong_answers_show.append([k,v])

        else:
            for k, v in wrong_answs_pom.items():
                wrong_answers_show.append(v)

        attendance_question[key] = {"attendance": attendance,
                                    "average": sum([i[1] for i in student_correct[key]]) / attendance,
                                    "sum_points": sum([i[1] for i in student_correct[key]]),
                                    "item_max_points": items[key].max_points,
                                    "num_correct_answers": len(student_correct[key]),
                                    "num_incorrect_answers": len(student_incorrect[key]),
                                    "wrong_answers": wrong_answs_pom,
                                    "wrong_answers_show": wrong_answers_show,

                                    }

    for section in template["sections"]:
        for item in section["questions"]:
            data = QuizItem.query.filter(QuizItem.quiz_template_item_id == item["item_id"]).all()
            if len(data) == 0:
                break

            comments = []

            for i in data:
                if i.students_comment_id is not None:
                    comment = Comment.query.get(i.students_comment_id)
                    comments.append(["student", comment.text])

                if i.teachers_comment_id is not None:
                    comment = Comment.query.get(i.teachers_comment_id)
                    comments.append(["teacher", comment.text])

            if item["questionType"] == "questions":
                if item["type"] == "short_answer_question":
                    correct_answer = data[0].question_version.short_answers[0].text

                elif item["type"] == "multiple_answer_question":
                    answs = []
                    for i in data[0].question_version.multiple_answers:
                        answs.append([i.id, i.text, i.is_correct])
                    correct_answer = answs


                else:
                    answs = {}
                    for pair in data[0].question_version.matching_question:
                        answs[pair.id] = [pair.leftSide, pair.rightSide]

                    new_answs = []
                    for key, val in answs.items():
                        dt = [val[0], val[1], key]
                        new_answs.append(dt)

                    correct_answer = new_answs

                question_analysis[item["item_id"]] = {
                    "correct_answer": correct_answer,
                    "comments": comments,
                }
            else:
                items = QuizItem.query.filter(QuizItem.quiz_template_item_id == item["item_id"]).all()

                data = []
                data2 = {}

                item_scores = 0
                for i in items:
                    item_id = i.id
                    item_score = i.score
                    item_max_score = i.max_points
                    question_type = i.question_version.type
                    question_title = i.question_version.title

                    item_scores+=item_score

                    dct2 = {
                        "item_id": item_id,
                        "item_score": item_score,
                        "item_max_score": item_max_score,
                        "question_type": question_type,
                        "question_title": question_title,
                        "achieved_points": [item_score],
                        "sum_points": item_score,
                        "question_version_id": i.question_version.question_id,
                        "number_attempts": 1,

                    }

                    if i.question_version.id not in data2:
                        data2[i.question_version.id] = dct2
                    else:
                        data2[i.question_version.id]["number_attempts"] += 1
                        data2[i.question_version.id]["achieved_points"].append(item_score)
                        data2[i.question_version.id]["sum_points"] += item_score

                for _, val in data2.items():
                    data.append(val)

                question_analysis[item["item_id"]] = {
                    "item_score": item_scores,
                    "item_max_score": item_max_score* len(items),
                    "item_average_score": round(item_scores / len(items), 2),
                    "wrong_answers": [],
                    "questions": data,
                    "comments": comments,
                }

    return {"result": template, "evals": question_analysis, "attendance": attendance_question}, 200


@quiz_statistics_bp.route("/get-quiz-template-students-results", methods=["GET"])
def get_quiz_students_results():
    quiz_template_id = request.args.get("template_id")

    # students = [{"student_id":i.id, "github_name": i.github_name} for i in User.query.filter_by(user_type="student").all()]
    students = [{"student_id":i.id, "github_name": i.github_name} for i in User.query.all()]


    results = []
    attended = 0
    sum_points = 0
    max_points = 0
    for i in students:

        quiz_students = {"student_id":i["student_id"], "github_name": i["github_name"]}
        quizzes_student = Quiz.query.filter_by(quiz_template_id = quiz_template_id, student_id=i["student_id"]).order_by(Quiz.date_time_started.desc()).all()
        quizzes = []
        cnt = 0

        if len(quizzes_student) == 0:
            quizzes.append(
                {
                    "points": "Not attended",
                    "max_points": 0,
                    "number_attempt": 0
                }
            )
            num_quizzes = 0
        else:
            attended+=1
            for quiz in quizzes_student:
                if cnt == 0:
                    sum_points += quiz.achieved_points
                    max_points = quiz.max_points

                quizzes.append(
                    {
                        "points": quiz.achieved_points,
                        "max_points": quiz.max_points,
                        "number_attempt": cnt
                    }
                )
                cnt+=1

            num_quizzes = len(quizzes)

        quiz_students["quizzes"] = quizzes
        quiz_students["num_quizzes"] = num_quizzes
        results.append(quiz_students)

        if max_points !=0:
            if num_quizzes == 0:
                average_points = 0
                average_points_perc = 0
            else:
                average_points = sum_points / num_quizzes
                average_points_perc = round((sum_points / (max_points * num_quizzes) *100), 2)
        else:
            average_points = 0
            average_points_perc=0

        data = {
            "attendance": attended,
            "num_students": len(students),
            "attendance_perc": round((attended / len(students)) *100,2),
            "average_points": average_points,
            "max_points": max_points,
            "average_points_perc": average_points_perc

        }

    return {"result": {"quiz_id": quiz_template_id, "students": results, "data": data}}