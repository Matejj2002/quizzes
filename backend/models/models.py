from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()


class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    is_deleted = db.Column(db.Boolean, default=False)
    category = db.relationship("Category", backref='category')
    question_feedback = db.Column(db.Text, default='')
    question_positive_feedback = db.Column(db.Text, default='')

    question_version = db.relationship('QuestionVersion', back_populates='questions', cascade='all, delete-orphan')


class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    stug = db.Column(db.String, default='')
    supercategory_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    subcategories = db.relationship(
        'Category', backref=db.backref('subcategory', remote_side=[id]),
        lazy="dynamic",
        cascade='all, delete-orphan',
    )

    quiz_template_items = db.relationship('QuizTemplateItem', back_populates='category')

    def __str__(self):
        return self.title


class QuestionVersion(db.Model):
    __tablename__ = 'question_versions'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'))
    title = db.Column(db.String)
    dateCreated = db.Column(db.DateTime)
    text = db.Column(db.Text)
    type = db.Column(db.String)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), default=1)

    author = db.relationship('User', back_populates='question_version')
    questions = db.relationship('Question', back_populates='question_version')

    __mapper_args__ = {
        'polymorphic_identity': 'question_version',
        'polymorphic_on': type
    }

class MatchingQuestion(QuestionVersion):
    __tablename__ = "matching_questions"
    id = db.Column(db.Integer, db.ForeignKey('question_versions.id'), primary_key=True)
    distractors = db.Column(db.ARRAY(db.String))

    matching_question = db.relationship('MatchingPair', backref='matching_question_pair', cascade='all, delete-orphan')

    __mapper_args__ = {
        'polymorphic_identity': 'matching_answer_question'
    }


class ShortAnswerQuestion(QuestionVersion):
    __tablename__ = "short_answer_questions"
    id = db.Column(db.Integer, db.ForeignKey('question_versions.id'), primary_key=True)

    short_answers = db.relationship('ShortAnswer', backref='short_answer_question', cascade='all, delete-orphan')

    __mapper_args__ = {
        'polymorphic_identity': 'short_answer_question'
    }


class MultipleChoiceQuestion(QuestionVersion):
    __tablename__ = "multiple_choice_questions"
    id = db.Column(db.Integer, db.ForeignKey('question_versions.id'), primary_key=True)

    multiple_answers = db.relationship('Choice', backref='multiple_choice_question', cascade='all, delete-orphan')

    __mapper_args__ = {
        'polymorphic_identity': 'multiple_answer_question'
    }


class Answer(db.Model):
    __tablename__ = "answers"
    id = db.Column(db.Integer, primary_key=True)
    positive_feedback = db.Column(db.Text)
    negative_feedback = db.Column(db.Text)
    type = db.Column(db.String)

    __mapper_args__ = {
        'polymorphic_identity': 'question_version',
        'polymorphic_on': type
    }


class MatchingPair(Answer):
    __tablename__ = "matching_pairs"
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    leftSide = db.Column(db.Text)
    rightSide = db.Column(db.Text)

    matching_question_id = db.Column(db.Integer, db.ForeignKey('matching_questions.id'))

    __mapper_args__ = {
        'polymorphic_identity': 'matching_pair'
    }


class Choice(Answer):
    __tablename__ = "choices"
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.Text)
    is_single = db.Column(db.Boolean)
    is_correct = db.Column(db.Boolean, default=False)

    choice_question_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_questions.id'))

    __mapper_args__ = {
        'polymorphic_identity': 'choice_answer'
    }


class ShortAnswer(Answer):
    __tablename__ = "short_answers"
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.Text)
    is_regex = db.Column(db.Boolean)

    short_answer_question_id = db.Column(db.Integer, db.ForeignKey('short_answer_questions.id'), nullable=True)

    __mapper_args__ = {
        'polymorphic_identity': 'simple_answer'
    }


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    question_version_id = db.Column(db.Integer, db.ForeignKey('question_versions.id'))
    text = db.Column(db.Text)
    date_created = db.Column(db.DateTime)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    github_name = db.Column(db.String, unique=True)

    user_type = db.Column(db.String(50), default='user')

    question_version = db.relationship('QuestionVersion', back_populates='author')


class Teacher(db.Model):
    __tablename__ = "teachers"
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True, autoincrement=True)

    def __str__(self):
        return self.name


class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)


class QuizTemplate(db.Model):
    __tablename__ = 'quiz_templates'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    ordered = db.Column(db.Boolean, default=True)
    shuffle_sections = db.Column(db.Boolean, default=False)
    correction_of_attempts = db.Column(db.String)

    number_of_corrections = db.Column(db.Integer, default=0)

    is_deleted = db.Column(db.Boolean, default=False)

    version = db.Column(db.Integer, default=0)

    order = db.Column(db.ARRAY(db.Integer))

    date_time_open = db.Column(db.DateTime)
    date_time_close = db.Column(db.DateTime)
    time_to_finish = db.Column(db.Integer)
    datetime_check = db.Column(db.DateTime)

    feedback_type = db.Column(db.ARRAY(db.Text))
    feedback_type_after_close = db.Column(db.ARRAY(db.Text))

    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'))
    teacher = db.relationship('Teacher')
    quiz_template_section = db.relationship('QuizTemplateSection', back_populates='quiz_template',
                                            cascade="all, delete")


class QuizTemplateSection(db.Model):
    __tablename__ = 'quiz_template_section'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.Text)
    shuffle = db.Column(db.Boolean)
    order = db.Column(db.ARRAY(db.Integer))

    quiz_template_id = db.Column(db.Integer, db.ForeignKey('quiz_templates.id'))
    quiz_template = db.relationship('QuizTemplate', back_populates='quiz_template_section')

    quiz_template_section_items = db.relationship('QuizTemplateItem', back_populates='item_section',
                                                  cascade="all, delete")


class QuizTemplateItem(db.Model):
    __tablename__ = 'quiz_template_items'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'))
    question_count = db.Column(db.Integer)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    include_sub_categories = db.Column(db.Boolean)
    evaluate = db.Column(db.Integer, default=0)
    question_type = db.Column(db.String)

    quiz_template_id = db.Column(db.Integer, db.ForeignKey('quiz_templates.id'))
    item_section_id = db.Column(db.Integer, db.ForeignKey('quiz_template_section.id'))

    category = db.relationship('Category', back_populates='quiz_template_items')
    question = db.relationship('Question')

    item_section = db.relationship('QuizTemplateSection', back_populates='quiz_template_section_items')


class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    date_time_started = db.Column(db.DateTime)
    date_time_finished = db.Column(db.DateTime)
    date_time_correction_started = db.Column(db.DateTime)
    date_time_correction_finished = db.Column(db.DateTime)
    order = db.Column(db.ARRAY(db.Integer))
    order_template = db.Column(db.ARRAY(db.Integer))
    max_points = db.Column(db.DECIMAL(10, 2), default=0)
    achieved_points = db.Column(db.DECIMAL(10, 2), default=0)

    quiz_template_id = db.Column(db.Integer, db.ForeignKey('quiz_templates.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    quiz_template = db.relationship('QuizTemplate', cascade="all, delete")

    quiz_sections = db.relationship('QuizSection', back_populates='quiz')


class QuizSection(db.Model):
    __tablename__ = 'quiz_sections'
    id = db.Column(db.Integer, primary_key=True)
    order = db.Column(db.ARRAY(db.Integer))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'))

    quiz_items = db.relationship('QuizItem', back_populates='items')
    quiz = db.relationship("Quiz", back_populates='quiz_sections')


class QuizItem(db.Model):
    __tablename__ = 'quiz_items'
    id = db.Column(db.Integer, primary_key=True)
    answer = db.Column(db.Text)
    score = db.Column(db.DECIMAL(10, 2))  # Decimal
    max_points = db.Column(db.DECIMAL(10, 2), default=0)

    order = db.Column(db.ARRAY(db.Integer))

    students_comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'))
    teachers_comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'))

    quiz_section_id = db.Column(db.Integer, db.ForeignKey('quiz_sections.id'))

    items = db.relationship("QuizSection")

    quiz_template_item_id = db.Column(db.Integer, db.ForeignKey('quiz_template_items.id', ondelete='SET NULL'),
                                      nullable=True)
    question_version_id = db.Column(db.Integer, db.ForeignKey('question_versions.id'))
    question_version = db.relationship('QuestionVersion')
