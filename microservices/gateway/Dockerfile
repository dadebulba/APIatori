FROM node:13

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json .
COPY ./package-lock.json .
COPY ./errorMsg.js .

RUN mkdir middleware
COPY ./middleware/mwAuth.js ./middleware

RUN mkdir config
COPY ./config ./config

# Bundle app source
COPY ./microservices/gateway/gateway.js .

# If you are building your code for production
RUN npm ci --only=production
#RUN npm install

EXPOSE 8080
CMD [ "node", "gateway.js" ]