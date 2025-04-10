"""Describe your changes

Revision ID: b838c97f0f9b
Revises: b54945d64b68
Create Date: 2025-03-13 09:13:10.887155

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b838c97f0f9b'
down_revision = 'b54945d64b68'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('questions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('question_feedback', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('questions', schema=None) as batch_op:
        batch_op.drop_column('question_feedback')

    # ### end Alembic commands ###
