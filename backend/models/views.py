import datetime

from flask import redirect, url_for, abort
from flask_admin import AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from wtforms_sqlalchemy.fields import QuerySelectField
from wtforms.fields import SelectField
from flask_dance.contrib.github import github
from models import *


class PolymorphicModelView(ModelView):
    form_columns = ['name', 'github_name', 'user_type']
    column_list = ['name', 'github_name', 'user_type']

    form_extra_fields = {
        'user_type': SelectField(
            'User Type',
            choices=[
                ('teacher', 'Teacher'),
                ('student', 'Student'),
            ],
            coerce=str
        )
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            if model.user_type == 'teacher':
                model.__class__ = Teacher
            elif model.user_type == 'student':
                model.__class__ = Student
        super().on_model_change(form, model, is_created)


class QuestionVersionView(ModelView):
    form_columns = ['author', 'questions', 'type', 'title']
    column_list = ['id', 'author', 'questions', 'question_id', 'type', 'title']

    form_extra_fields = {
        'author': QuerySelectField(
            'Author',
            query_factory=lambda: User.query.filter_by(user_type='teacher'),
            get_label='name',
            allow_blank=True
        ),
        'questions': QuerySelectField(
            'Question',
            query_factory=lambda: Question.query.all(),
            allow_blank=True
        )
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.type = model.__mapper_args__['polymorphic_identity']
            model.dateCreated = datetime.datetime.now()

        if form.questions.data:
            model.question_id = form.questions.data.id
        super().on_model_change(form, model, is_created)

    form_excluded_columns = ['type']


class CategoryView(ModelView):
    form_columns = ['title', 'supercategory_id']
    column_list = ['id', 'title', 'supercategory_id']

    form_extra_fields = {
        'supercategory_id': QuerySelectField(
            'Nadradená kategória',
            query_factory=lambda: Category.query.all(),
            get_label='title',
            allow_blank=True
        )
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.supercategory_id = form.supercategory_id.data.id

        super().on_model_change(form, model, is_created)

    def get_query(self):
        return self.session.query(self.model).filter(self.model.title != "supercategory")


class QuestionView(ModelView):
    # nema title
    form_columns = ['category']
    column_list = ['id', 'category']

    form_extra_fields = {
        'category': QuerySelectField(
            'Kategoria',
            query_factory=lambda: Category.query.all(),
            get_label='title'
        )
    }

    def on_model_change(self, form, model, is_created):
        if 'categories' in form.data:
            model.categories = form.categories.data
        super().on_model_change(form, model, is_created)


class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not github.authorized:
            return redirect(url_for('github.login'))

        resp = github.get('/user')
        if not resp.ok:
            abort(403)

        user_info = resp.json()
        github_username = user_info.get('login')
        teachers = Teacher.query.filter_by(github_name=github_username).all()
        if len(teachers) == 0:
            abort(403)

        return super().index()


class ChoiceView(ModelView):
    column_list = ('id', 'text', 'choice_question_id')
    form_columns = ('text', 'choice_question_id')
    column_searchable_list = ['text']
