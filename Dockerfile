FROM node:18-alpine as base
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app
COPY --chown=node:node package.json yarn.lock ./
RUN yarn config set no-progress && yarn install --production
ENV PATH=$PATH:/app/node_modules/.bin


FROM base as source
COPY --chown=node:node package.json yarn.lock /app/
RUN yarn --production=false
COPY --chown=node:node . .


FROM source as production-build
RUN yarn build

FROM base as production
ENV NODE_ENV=production NODE_PATH=/app
COPY --chown=node:node . .

RUN yarn install --prodcution && yarn cache clean

CMD ["node", "src/index.js"]
