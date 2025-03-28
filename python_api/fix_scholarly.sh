#!/bin/bash
source venv/bin/activate
pip uninstall -y scholarly free-proxy
pip install scholarly==1.6.0
pip install fake-useragent==0.1.11
pip freeze > requirements.txt