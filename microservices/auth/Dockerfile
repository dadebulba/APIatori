FROM node:13

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json .
COPY ./package-lock.json .
COPY ./utility.js .
COPY ./errorMsg.js .

RUN mkdir config
COPY ./config ./config

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./microservices/auth/token.js .
COPY ./microservices/auth/tokenImpl.js .

EXPOSE 3000
CMD [ "node", "token.js" ]