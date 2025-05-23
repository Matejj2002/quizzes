FROM node:18 AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY frontend ./
RUN npm run build

FROM python:3.10
WORKDIR /app

COPY backend/requirements.txt .

RUN pip install -r requirements.txt

COPY backend ./

COPY --from=builder app/build static/
COPY .env .env
#COPY frontend/.env.production .env.production
#
#RUN cat .env.production >> .env

CMD ["python", "app.py"]
