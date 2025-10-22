FROM node:20-alpine

WORKDIR /app

COPY server/package.json ./
RUN npm install --production

COPY server/src ./src
COPY client/build ./client/build

EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/server.js"]
