FROM python:3.7-slim

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

CMD gunicorn --bind localhost:5000 --worker-class eventlet -w 1 'app:app'
