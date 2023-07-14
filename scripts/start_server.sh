#!/bin/bash
cd /home/ubuntu/Interactive/frontend
pkill yarn

cp /home/ubuntu/Interactive-Tutor/frontend/src/env.js /home/ubuntu/Interactive/frontend/src/
cp /home/ubuntu/Interactive-Tutor/frontend/cert.crt /home/ubuntu/Interactive/frontend/
cp /home/ubuntu/Interactive-Tutor/frontend/key.key /home/ubuntu/Interactive/frontend/

yarn start

cd /home/ubuntu/Interactive/backend
cp /home/ubuntu/Interactive-Tutor/backend/cert.crt /home/ubuntu/Interactive/backend/
cp /home/ubuntu/Interactive-Tutor/backend/key.key /home/ubuntu/Interactive/backend/
cp /home/ubuntu/Interactive-Tutor/backend/project/.env /home/ubuntu/Interactive/backend/project/

source venv/bin/activate
pkill python3
# sudo python3 manage.py runserver
supervisorctl -c /home/ubuntu/Interactive/scripts/supervisord.conf reload