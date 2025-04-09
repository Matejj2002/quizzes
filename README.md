# Quizzes application for Logic Workbook

This project was created with [Create React App](https://github.com/facebook/create-react-app).

## Starting Project
- ### How to start backend on local machine
  In project directory run:
  -    if using bash, cmd: `.venv\\Scripts\\python.exe backend\\app.py`
  -    if using powershell: `python backend\\app.py`

Once backend is started, frontend is served using backend.

## Building project
To build whole project, run `python setup.py`

## Run in docker
You need to have installed docker

If you want to build project from scratch, run `docker compose up --build` 

If you want to start docker, but you don't need to rebuild, run `docker compose up`

If you want to shut down containters, run `docker compose down`

Migrations of database, creating database if not exists is automatic.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
