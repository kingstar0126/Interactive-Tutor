FROM python:3.10.13-slim-bullseye

WORKDIR /var/app

COPY . .

RUN apt update && apt install nodejs npm -y
RUN npm install -g pm2
RUN pip install -r requirements.txt 


EXPOSE 5000

ENTRYPOINT [ "pm2-runtime", "wsgi.py" ]