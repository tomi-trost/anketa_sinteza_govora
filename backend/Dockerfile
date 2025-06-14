FROM python:3.10.12-slim

ARG ENVIRONMENT=development
RUN echo "Building for environment: $ENVIRONMENT"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        build-essential \
        curl \
        git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Copy only pyproject.toml and poetry.lock first for caching dependencies
COPY pyproject.toml poetry.lock* ./

# Install dependencies without installing the current package (no-root)
RUN poetry config virtualenvs.create false && poetry install --no-root --no-interaction --no-ansi

# Copy application code
COPY ./app ./app
COPY ./scripts ./scripts
COPY ./static_audio ./static_audio

# Make prestart script executable
RUN chmod +x scripts/prestart.sh

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
