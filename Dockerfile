FROM node:12
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN yarn install --production
CMD ["yarn", "start"]

# CMD ["yarn", "run", "dev"]
