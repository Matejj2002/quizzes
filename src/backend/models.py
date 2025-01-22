from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    is_deleted = db.Column(db.Boolean, default=False)
    # versions = db.relationship('QuestionVersion', backref='question', cascade='all, delete-orphan')
    category = db.relationship("Category", backref='category')

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

    # subcategories vztah, optional 0..1 - kompozicia OK

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
    author_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), default=1)

    author = db.relationship('Teacher', back_populates='question_version')
    questions = db.relationship('Question', back_populates='question_version')

    __mapper_args__ = {
        'polymorphic_identity': 'question_version',
        'polymorphic_on': type
    }

    # matching_question = db.relationship('MatchingQuestion', backref='question', cascade='all, delete-orphan')


class MatchingQuestion(QuestionVersion):
    __tablename__ = "matching_questions"
    id = db.Column(db.Integer, db.ForeignKey('question_versions.id'), primary_key=True)

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


# Trieda answer, feedbacks db.Text
# simpleanswer, matchingpair podtriedy


class Answer(db.Model):
    __tablename__ = "answers"
    id = db.Column(db.Integer, primary_key=True)
    positive_feedback = db.Column(db.Text)
    negative_feedback = db.Column(db.Text)
    type = db.Column(db.String)
    is_correct = db.Column(db.Boolean, default = False)

    __mapper_args__ = {
        'polymorphic_identity': 'question_version',
        'polymorphic_on': type
    }


class MatchingPair(Answer):
    __tablename__ = "matching_pairs"
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    leftSide = db.Column(db.Text)
    rightSide = db.Column(db.Text)
    # leftSide, rightSide #db.Text

    matching_question_id = db.Column(db.Integer, db.ForeignKey('matching_questions.id'))

    __mapper_args__ = {
        'polymorphic_identity': 'matching_pair'
    }


class Choice(Answer):
    __tablename__ = "choices"
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.Text)
    is_single = db.Column(db.Boolean)

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
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # author_id FK
    question_version_id = db.Column(db.Integer, db.ForeignKey('question_versions.id'))  # question_version_id FK
    text = db.Column(db.Text)
    date_created = db.Column(db.DateTime)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    github_name = db.Column(db.String)

    user_type = db.Column(db.String(50), default='user')

    __mapper_args__ = {
        'polymorphic_identity': 'user',
        'polymorphic_on': user_type
    }


class Teacher(User):
    __tablename__ = "teachers"
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True, autoincrement=True)

    question_version = db.relationship('QuestionVersion', back_populates='author')

    __mapper_args__ = {
        'polymorphic_identity': 'teacher',
    }

    def __str__(self):
        return self.name


class Student(User):
    __tablename__ = "students"
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 'student',
    }
