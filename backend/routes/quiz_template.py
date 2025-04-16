from flask import Blueprint, request, jsonify
import requests
try:
    from backend.api.api_functions import *
except:
    from api.api_functions import *

quiz_template_bp = Blueprint('quiz_template', __name__, url_prefix='/api/')

@quiz_template_bp.route("/get-quiz-templates", methods=["GET"])
def get_quiz_templates():
    student_id = request.args.get("studentId")
    try:
        int(student_id)
    except:
        return {}, 404
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

@quiz_template_bp.route("/new-quiz-template-check", methods=["POST"])
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

@quiz_template_bp.route("/new-quiz-template", methods=["PUT"])
def create_new_quiz_template():
    data = request.get_json()

    if data["changeData"]:
        vers = 0
        if data["quizId"] != 0:
            quiz_template = QuizTemplate.query.filter_by(id=data["quizId"]).first()
            # quiz = Quiz.query.filter_by(quiz_template_id=data["quizId"]).all()

            # for i in quiz:
            #     print(i)
            #     db.session.delete(i)
            # db.session.delete(quiz_template)
            new_title = quiz_template.title.split("_version")
            vers = quiz_template.version
            quiz_template.title = new_title[0] + "_version" + str(vers + 1)
            # quiz_template.is_deleted = True
            quiz_template.version = vers + 1
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
            feedback_type_after_close=data["feedbackTypeAfterClose"],
            version=vers

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
