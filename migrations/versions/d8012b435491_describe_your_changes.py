"""Describe your changes

Revision ID: d8012b435491
Revises: f88763b5c34d
Create Date: 2025-03-22 17:54:22.127529

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8012b435491'
down_revision = 'f88763b5c34d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('order', sa.ARRAY(sa.Integer()), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('quiz_items', schema=None) as batch_op:
        batch_op.drop_column('order')

    # ### end Alembic commands ###
