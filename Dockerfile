FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5001 5173

ENV PORT=5001
ENV NODE_ENV=production

CMD ["npm", "run", "dev"]
