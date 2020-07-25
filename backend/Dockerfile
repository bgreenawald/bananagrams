FROM python:3.7-slim

# Install system dependencies
RUN apt-get update \
&& apt-get install gcc git curl -y \
&& apt-get clean

# Install poetry
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
ENV PATH="${PATH}:/root/.poetry/bin"

# Get poetry environment files
COPY pyproject.toml /tmp/pyproject.toml
COPY poetry.lock /tmp/poetry.lock

WORKDIR /tmp

# Export poetry to requirements
RUN poetry export -f requirements.txt > requirements.txt

# Install the requirements
RUN pip install -r requirements.txt

# Copy over application code
COPY . /app
WORKDIR /app

EXPOSE 5000

CMD gunicorn --bind :5000 --worker-class eventlet -w 1 'app:app'
