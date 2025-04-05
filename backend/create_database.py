from models.models import *
from app import app


def create_database():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print('Database created and tables initialized!')
        supercategory = Category(title="supercategory")
        db.session.add(supercategory)
        db.session.commit()


if __name__ == '__main__':
    create_database()
