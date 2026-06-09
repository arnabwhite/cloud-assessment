FROM node:22-alpine

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts && pnpm rebuild esbuild sharp

COPY . .

ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN pnpm run build

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
