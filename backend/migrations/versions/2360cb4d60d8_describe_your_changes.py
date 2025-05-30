"""Describe your changes

Revision ID: 2360cb4d60d8
Revises: 51059da5902a
Create Date: 2025-02-25 21:16:55.948438

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2360cb4d60d8'
down_revision = '51059da5902a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_template_section', schema=None) as batch_op:
        batch_op.add_column(sa.Column('shuffle', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_template_section', schema=None) as batch_op:
        batch_op.drop_column('shuffle')

    # ### end Alembic commands ###
