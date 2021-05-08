FROM node:12
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN yarn install --production
RUN yarn add tsc
CMD ["yarn", "start"]

# CMD ["yarn", "run", "dev"]
