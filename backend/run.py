from project import create_app

app = create_app()

if __name__ == '__main__':
    # app.run(ssl_context=('cert.crt', 'key.key'), debug=True)
    app.run(port=5000, debug=True)
