FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the project into /app
COPY . /app
WORKDIR /app/backend

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED=1

# Install dependencies
RUN uv sync

# Expose the default Cloud Run port
EXPOSE 8080

# Run the FastAPI server
# Note: When using heroku.yml, the CMD is overridden by the 'run' section
CMD ["sh", "-c", "uv run uvicorn main:app --host=0.0.0.0 --port=${PORT:-8080}"]
