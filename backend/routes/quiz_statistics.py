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
        print(achieved_points)

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

@quiz_statistics_bp.route("/quiz-statistics", methods=["GET"])
def quiz_statistics():
    template_id = request.args.get("template_id")

    template = get_quiz_template(0, template_id)[0]

    question_analysis = {}
    quiz_items = {}
    for section in template["sections"]:
        for item in section["questions"]:
            item_score = 0
            item_max_score = 0
            data = QuizItem.query.filter(QuizItem.quiz_template_item_id == item["item_id"]).all()
            if len(data)==0:
                break
            student_id = data[0].items.quiz.student_id

            item_full_score = data[0].max_points

            student_answers = []
            num_correct = 0
            comments = []
            for i in data:

                if i.students_comment_id is not None:
                    comment = Comment.query.get(i.students_comment_id)
                    comments.append(["student", comment.text])

                if i.teachers_comment_id is not None:
                    comment = Comment.query.get(i.teachers_comment_id)
                    comments.append(["teacher", comment.text])

                item_score += i.score
                item_max_score += i.max_points

                answer = json.loads(i.answer)
                if i.score == 0:
                    student_answers.append(answer["answer"])
                else:
                    num_correct += 1

                if item["item_id"] in quiz_items:
                    if student_id not in quiz_items[item["item_id"]] and i.score > 0:
                        quiz_items[item["item_id"]].append(student_id)
                else:
                    quiz_items[item["item_id"]] = []

            if item["questionType"] == "questions":
                if item["type"] == "short_answer_question":
                    correct_answer = data[0].question_version.short_answers[0].text

                    result = {}
                    for i in student_answers:
                        result[i] = result.get(i, 0) + 1

                    data_app = []
                    for key, val in result.items():
                        data_app.append([key, val])

                    student_answers = data_app

                elif item["type"] == "multiple_answer_question":
                    answs = []
                    multiple_answers_stat = {}

                    for i in data[0].question_version.multiple_answers:
                        answs.append([i.id, i.text, i.is_correct])
                        multiple_answers_stat[i.id] = {"correct": num_correct, "incorrect": 0, "value": i.is_correct,
                                                       "sum": num_correct}

                    for i in student_answers:
                        for j in i:
                            val_j = True
                            if j[2] == "False":
                                val_j = False

                            if multiple_answers_stat[j[1]]["value"] == val_j:
                                multiple_answers_stat[j[1]]["correct"] += 1
                            else:
                                multiple_answers_stat[j[1]]["incorrect"] += 1
                            multiple_answers_stat[j[1]]["sum"] += 1

                    correct_answer = answs
                    student_answers = multiple_answers_stat

                else:
                    answs = {}
                    pair_data = {}
                    matching_data_corr = {}
                    for pair in data[0].question_version.matching_question:
                        answs[pair.id] = [pair.leftSide, pair.rightSide]
                        pair_data[pair.id] = pair.rightSide
                        matching_data_corr[pair.id] = {"correct": num_correct, "incorrect": 0, "sum": num_correct}

                    changed_correct = {}
                    zoz_id = []
                    for i in student_answers:
                        for ans in i:
                            correct_answer = pair_data.get(ans["pairId"])
                            student_answer = ans["answer"]
                            if student_answer == []:
                                student_answer = "No answer"

                            if student_answer == correct_answer:
                                matching_data_corr[ans["pairId"]]["correct"] += 1
                            else:
                                matching_data_corr[ans["pairId"]]["incorrect"] += 1
                            matching_data_corr[ans["pairId"]]["sum"] += 1

                            merged_corr_stud = correct_answer + "->" + student_answer

                            changed_correct[merged_corr_stud] = changed_correct.get(merged_corr_stud, 0) + 1
                            zoz_id.append(ans["pairId"]);

                    changed_to_list = []
                    cnt = 0
                    for key, val in changed_correct.items():
                        corr, incorr = key.split("->")
                        changed_to_list.append([corr, incorr, val])

                        cnt += 1

                    new_answs = []
                    for key, val in answs.items():
                        dt = [val[0], val[1], matching_data_corr[key]["correct"], matching_data_corr[key]["incorrect"],
                              matching_data_corr[key]["sum"]]
                        new_answs.append(dt)

                    student_answers = changed_to_list
                    correct_answer = new_answs

                    # print(data[0].question_version)
                question_analysis[item["item_id"]] = {
                    "item_score": item_score,
                    "item_max_score": item_max_score,
                    "item_average_score": round(item_score / len(data), 2),
                    "correct_answer": correct_answer,
                    "wrong_answers": student_answers,
                    "item_full_score": item_full_score,
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
                    "item_full_score": item_full_score,
                    "questions": data,
                    "comments": comments,
                }

    return {"result": template, "evals": question_analysis, "correct_students": quiz_items}, 200
