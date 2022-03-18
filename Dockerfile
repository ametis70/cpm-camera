# Process
FROM python:3.9.10-bullseye AS builder-process

RUN pip3 install poetry==1.1.13
RUN poetry config virtualenvs.create false

RUN printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" > /etc/pip.conf

WORKDIR /app
COPY ./process .
RUN poetry install 
RUN poetry run pyinstaller --onefile process.py

# Website
FROM node:16.14.0-bullseye as builder-web

WORKDIR /app
COPY ./website/package*.json ./
RUN npm ci --only=production

COPY ./website /app
RUN npm run build

# Runtime
FROM node:16.14.0-bullseye as runtime

WORKDIR /app
COPY --from=builder-process /app/dist/process /app/process/process
COPY --from=builder-web /app/build/ /app/website/build

COPY ./package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]