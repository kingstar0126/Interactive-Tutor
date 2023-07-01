from waitress import serve
from project import create_app

app = create_app()
serve(app, host='0.0.0.0', port=8888)
