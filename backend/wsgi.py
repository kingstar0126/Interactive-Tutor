from project import create_app
import os

app = create_app()

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    httpd = make_server('localhost', 5000, app)
    httpd.serve_forever()
