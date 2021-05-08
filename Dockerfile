FROM node:12
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN yarn add pm2 -g
CMD ["yarn", "start"]

# CMD ["yarn", "run", "dev"]
