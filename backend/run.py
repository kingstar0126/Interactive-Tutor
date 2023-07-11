from project import create_app
import ssl

app = create_app()

if __name__ == '__main__':
    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain('cert.pem', 'dkey.pem')
    app.run(ssl_context=context)
