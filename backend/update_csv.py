from project import create_app
from project.models import db, User
from project.wonde import make_csv_file
import os
import click

app = create_app()
app.app_context().push()

@click.command()
def update_data():
    users = db.session.query(User).all()
    for user in users:
        if user.role == 7 and user.wonde_key is not None:
            df = make_csv_file(user.wonde_key)
            if df is not None:
                df.to_csv(f'wonde_csvs/{user.id}students.csv', index=False)

def compare_month():
    today = datetime.today()
    is_new_month = today.day == 1

    if is_new_month:
        users = db.session.query(User).all()
        for user in users:
            query = max(user.query - user.usage, 0)

            if user.role == 2:
                user.query = query + 500
            elif user.role == 3:
                user.query = query + 3000
            elif user.role == 4:
                user.query = query + 10000
            elif user.role == 7:
                user.query = query + 30000
            user.usage = 0
            print('Database reset')
            db.session.commit()

if __name__ == "__main__":
    update_data()
    compare_month()