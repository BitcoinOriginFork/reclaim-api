FROM node:8.11.0

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb
RUN dpkg -i dumb-init_*.deb

RUN mkdir /server

# Cache node modules
COPY package.json ./server/package.json
COPY pm2.json ./server/pm2.json

RUN cd server && npm install

# Copy only production code
COPY ./src/ ./server/src/
COPY ./migrations/ ./server/migrations/
COPY ./tsconfig.json ./server/tsconfig.json

COPY tslint.json ./server

RUN cd server && npm run compile
RUN cd server && rm -rf src

CMD ["dumb-init", "/server/node_modules/.bin/pm2-docker", "start", "/server/pm2.json"]
