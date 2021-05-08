FROM node:12
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN yarn
CMD ["yarn", "start"]

# CMD ["yarn", "run", "dev"]
