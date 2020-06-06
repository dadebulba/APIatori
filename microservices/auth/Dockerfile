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

RUN mkdir data_layer
RUN mkdir data_layer/user_data_layer
COPY ./data_layer/user_data_layer ./data_layer/user_data_layer
COPY ./data_layer/utility.js ./data_layer

RUN mkdir errors
COPY ./errors ./errors

# Bundle app source
COPY ./microservices/auth/token.js .
COPY ./microservices/auth/tokenImpl.js .

# If you are building your code for production
RUN npm ci --only=production
#RUN npm install

EXPOSE 3000
CMD [ "node", "token.js" ]