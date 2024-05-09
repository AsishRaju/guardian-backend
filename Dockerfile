FROM --platform=linux/amd64 node:21.5.0

EXPOSE 8080

WORKDIR /usr/src/guardian-backend

COPY package*.json ./

RUN npm i

COPY . .

USER node

CMD [ "node","server.js" ]