FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY app.js ./
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
