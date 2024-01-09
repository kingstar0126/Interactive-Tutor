#!/bin/bash
# git pull
# cd /home/ubuntu/Interactive-Tutor/frontend
# yarn install
# yarn build
cd /home/ubuntu/Interactive-Tutor/backend
source /home/ubuntu/Interactive-Tutor/backend/venv/bin/activate
# pip install -r requirements.txt
python3 wsgi.py
