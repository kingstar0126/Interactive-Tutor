from gevent.pywsgi import WSGIServer
from project import create_app
import os

app = create_app()

if __name__ == '__main__':
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
