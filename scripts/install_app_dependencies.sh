#!/bin/bash
cd /home/ubuntu/Interactive/frontend
yarn install
cd /home/ubuntu/Interactive/backend
sudo apt-get update
sudo apt-get install python3-pip -y
sudo pip3 install virtualenv
sudo virtualenv venv
source venv/bin/activate
pip3 install -r requirements.txt