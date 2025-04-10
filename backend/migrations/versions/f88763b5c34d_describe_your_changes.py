"""Describe your changes

Revision ID: f88763b5c34d
Revises: 9bdf938d3a17
Create Date: 2025-03-21 12:25:59.637295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f88763b5c34d'
down_revision = '9bdf938d3a17'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('questions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('question_positive_feedback', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('questions', schema=None) as batch_op:
        batch_op.drop_column('question_positive_feedback')

    # ### end Alembic commands ###
