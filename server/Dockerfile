FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
COPY habits_api ./habits_api

RUN pip install --no-cache-dir .

EXPOSE 8787

CMD ["habits-api"]
