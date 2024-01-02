FROM 987025303706.dkr.ecr.eu-west-2.amazonaws.com/interactive-tutor-staging-backend_base

WORKDIR /var/app

COPY . .

RUN apk add py3-yaml py3-setuptools py3-wheel python3-dev &&\
    apk add --no-cache --virtual .build-deps build-base libffi-dev gcc musl-dev && \
    python3 -m venv venv && \
    pip install --upgrade pip setuptools &&\
    apk add py3-yaml &&\
    pip install PyYAML==6.0 --no-build-isolation

RUN source venv/bin/activate && \
    pip install wheel Flask-Migrate
RUN pip install -r requirements.txt 
RUN pip install python-docx 

EXPOSE 5000

# ENTRYPOINT ["tail", "-f", "/dev/null"]
ENTRYPOINT [ "pm2-runtime", "wsgi.py" ]