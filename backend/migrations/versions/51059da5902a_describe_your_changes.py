"""Describe your changes

Revision ID: 51059da5902a
Revises: cd25e28b8013
Create Date: 2025-02-25 21:08:49.204286

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '51059da5902a'
down_revision = 'cd25e28b8013'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_template_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('item_section_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'quiz_template_section', ['item_section_id'], ['id'])
        batch_op.drop_column('order')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_template_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('order', postgresql.ARRAY(sa.INTEGER()), autoincrement=False, nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('item_section_id')

    # ### end Alembic commands ###
