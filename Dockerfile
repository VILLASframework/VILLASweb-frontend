FROM node:7-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Create public directory
RUN mkdir -p /usr/src/app/public
RUN mkdir -p /usr/src/app/nodes

# Bundle app source
COPY . /usr/src/app

# Store uploaded files into a volume
VOLUME /usr/src/app/public/

# Run the app
EXPOSE 4000
CMD [ "npm", "start" ]
