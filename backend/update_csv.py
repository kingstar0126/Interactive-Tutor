from project import create_app
from project.models import db, User
import os
import click
import datetime

app = create_app()
app.app_context().push()

def compare_month():
    today = datetime.date.today()
    is_new_month = today.day == 1

    if is_new_month:
        users = db.session.query(User).all()
        for user in users:
            query = max(user.query - user.usage, 0)

            if user.role == 2:
                user.query = 500
            elif user.role == 3:
                user.query = 3000
            elif user.role == 4:
                user.query = 10000
            elif user.role == 7:
                user.query = 30000
            user.usage = 0
            print('Database reset')
            db.session.commit()

if __name__ == "__main__":
    compare_month()