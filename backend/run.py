from project import create_app
from flask_sslify import SSLify

app = create_app()
sslify = SSLify(app)

if __name__ == '__main__':
    app.run(ssl_context=('cert.crt', 'key.key'))