FROM python:3.10.13-slim-bullseye

WORKDIR /var/app

COPY . .

RUN pip install -r requirements.txt 


EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "project:create_app()", "--reload", "--timeout", "900", "--log-level=debug", "--workers=4"]