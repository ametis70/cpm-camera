# Process
FROM python:3.9.10-bullseye AS builder-process

RUN apt-get install -y build-essential libssl-dev libffi-dev python-dev rustc
RUN printf "[global]\nextra-index-url=https://www.piwheels.org/simple\n" > /etc/pip.conf

RUN pip3 install poetry==1.1.13
RUN poetry config virtualenvs.create false

WORKDIR /app
COPY ./process .
RUN poetry install 
RUN ./build.sh

# Website
FROM node:16.14.0-bullseye as builder-web

LABEL org.opencontainers.image.source="https://github.com/ametis70/cpm-camera"

WORKDIR /app
COPY ./website/package*.json ./
RUN npm ci --only=production

COPY ./website /app
RUN npm run build

# Runtime
FROM node:16.14.0-bullseye as runtime

WORKDIR /app
COPY --from=builder-process /app/process /app/process/process
COPY --from=builder-web /app/build/ /app/website/build

COPY ./package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000
VOLUME /app/storage

CMD ["node", "index.js"]
