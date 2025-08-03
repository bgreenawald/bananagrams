FROM python:3.13-slim

# Install system dependencies
RUN apt-get update \
&& apt-get install gcc git curl -y \
&& apt-get clean

# Install uv
RUN pip install uv

# Copy over application code
COPY . /app
WORKDIR /app

# Install dependencies using uv
RUN uv pip install --system -r pyproject.toml

EXPOSE 5000

CMD gunicorn --bind :5000 --worker-class eventlet -w 1 'app:app'
