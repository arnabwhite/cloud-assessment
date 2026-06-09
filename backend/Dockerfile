FROM node:22-alpine

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set ignore-scripts false && pnpm install

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
