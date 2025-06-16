import os
import json
import re
from sqlalchemy import desc
if os.environ.get("IS_DOCKER") == 'true':
    from models.views import *
    from models.models import *
else:
    try:
        from backend.models.views import *
        from backend.models.models import *
    except:
        from models.views import *
        from models.models import *

def fetch_question_data(question_id):
    question = Question.query.get_or_404(question_id)

    versions = question.question_version

    versions_list = [
        {
            "id": version.id,
            "title": version.title,
            "dateCreated": version.dateCreated.strftime('%Y-%m-%d %H:%M:%S') if version.dateCreated else None,
            "author_id": version.author_id,
            "author_name": version.author.github_name,
            "text": version.text,
            "type": version.type
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
        "is_deleted": question.is_deleted,
        "category": question.category.title if question.category else None,
        "versions": newest_version,
        "author_id": newest_version['author_id'],
        "author_name": newest_version['author_name'],
        "type": newest_version['type'],
    }

    return question_dict

def category_show_helper(category_id):
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

    return result

def tree_categories(node):
    result = {
        "title": node.title,
        "id": node.id,
        "children": [tree_categories(child) for child in node.subcategories]
    }
    return result


def list_subcategories(node):
    subcategories = []

    def traverse(node):
        for child in node.subcategories:
            subcategories.append({"title": child.title, "id": child.id})
            traverse(child)

    traverse(node)
    return subcategories


def generate_category_tree(category, level=0):
    result = [{
        "id": category["id"],
        "title": f"{'– ' * (level - 1)}{category['title']}"
    }]

    if category.get("children"):
        for i in category['children']:
            result.extend(generate_category_tree(i, level + 1))

    return result


def get_questions_from_category_helper(subcat, question_type, index):
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

        if latest_version.type in type_sel and not i.is_deleted:
            author = User.query.get_or_404(latest_version.author_id).github_name
            version = {
                "id": i.id,
                "title": latest_version.title,
                "text": latest_version.text,
                "type": latest_version.type,
                "dateCreated": latest_version.dateCreated,
                "authorName": author
            }
            questions_versions.append(version)

    return questions_versions

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


def get_quiz_template(student_id, quiz_template_id, actual_time=datetime.datetime.now(), cnt=0, update_at=""):
    template = QuizTemplate.query.filter(QuizTemplate.id == quiz_template_id).first()
    if template is None:
        return None, None

    if template.is_deleted:
        return None, None

    import pytz
    bratislava_tz = pytz.timezone("Europe/Bratislava")
    open_quiz = bratislava_tz.localize(template.date_time_open)
    close_quiz =bratislava_tz.localize(template.date_time_close)
    check_quiz = bratislava_tz.localize(template.datetime_check)
    actual_time = datetime.datetime.now(bratislava_tz)
    if open_quiz <= actual_time <= close_quiz:
        is_opened = True
    else:
        is_opened = False

    time_limit_end = False
    if actual_time > close_quiz:
        time_limit_end = True

    can_be_checked = False
    if actual_time >= check_quiz:
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
        "sections_ordered": [],
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
                     "item_id": question_item.id,
                     "text": latest_version.text
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
        time_end = bratislava_tz.localize(student_quizzes[0].date_time_started + datetime.timedelta(minutes=template.time_to_finish))

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
                "started": i.date_time_started,
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

    return template_sub, update_at

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

    sections_sorted = {}
    for section in quiz["sections"]:
        section_added = QuizSection(
            quiz_id=new_quiz.id
        )

        db.session.add(section_added)
        db.session.commit()
        order_sections.append(section_added.id)

        sections_sorted[section_added.id] = section["section_id"]

        order_questions = []

        for question in section["questions"]:
            new_item = QuizItem(
                answer=json.dumps({"evaluate": question["evaluation"]}),
                score=0,
                question_version_id=questions[str(question["id"])]["id"],
                quiz_section_id=section_added.id,
                max_points=0,
                quiz_template_item_id=question["item_id"]
            )

            if question["questionType"] == "questions":
                version = QuestionVersion.query.filter(
                    QuestionVersion.id == questions[str(question["id"])]["id"]).first()

                order_options = []
                if question["type"] == "short_answer_question":
                    order_options = [version.short_answers[0].id]
                elif question["type"] == "multiple_answer_question":
                    mult_opts = [i.id for i in version.multiple_answers]
                    shuffle(mult_opts)
                    order_options = mult_opts

                else:
                    try:
                        order_options = [i.id for i in version.matching_question]
                    except:
                        pass

            db.session.add(new_item)
            db.session.commit()

            if question["questionType"] == "questions":
                new_item.order = order_options
                db.session.add(new_item)
                db.session.commit()

            order_questions.append(new_item.id)

        if section["shuffle"]:
            shuffle(order_questions)

        section_added.order = order_questions

    if quiz["shuffle_sections"]:
        shuffle(order_sections)

    sections_template = []
    for i in order_sections:
        sections_template.append(sections_sorted[i])

    new_quiz.order = order_sections
    new_quiz.order_template = sections_template
    db.session.commit()

    return time_to_finish, new_quiz.id

