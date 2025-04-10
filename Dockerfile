# 1. Postavíme React frontend
FROM node:18 AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend ./
RUN npm run build

FROM python:3.10
WORKDIR /app

COPY backend/requirements.txt .

RUN pip install -r requirements.txt

COPY backend ./

RUN mkdir -p backend/static
COPY --from=builder /app/build backend/static/
COPY .env .env

CMD ["python", "app.py"]
