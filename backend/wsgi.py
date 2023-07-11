import os
from project import create_app

app = create_app()

if __name__ == '__main__':
    # Set Gunicorn worker timeout to 120 seconds
    from gunicorn import util
    util.SERVER_SOFTWARE = 'gunicorn'
    from gunicorn import glogging
    glogging.Logger.timeout = 1800

    app.run()
