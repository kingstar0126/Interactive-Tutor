import project

if __name__ == '__main__':
    app = project.create_app()
    app.run(debug=True, host='0.0.0.0')