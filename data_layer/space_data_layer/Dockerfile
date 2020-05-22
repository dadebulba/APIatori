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
COPY ./data_layer/space_data_layer/spaceDataLayer.js .
COPY ./data_layer/space_data_layer/spaceDataLayerImpl.js .
COPY ./data_layer/space_data_layer/spaceSchema.js .
#COPY ./groupDataLayer.js .
#COPY ./groupDataLayerImpl.js .
#COPY ./groupSchema.js .

EXPOSE 3334
# CMD [ "node", "groupDataLayer.js" ]
CMD [ "node", "spaceDataLayer.js" ]