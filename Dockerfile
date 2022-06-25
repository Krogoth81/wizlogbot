FROM node:18-alpine as base
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app
COPY --chown=node:node . .
RUN yarn --production=false
RUN yarn build

COPY --chown=node:node dist /app

COPY --chown=node:node .env /app/

CMD ["node", "src/index.js"]
