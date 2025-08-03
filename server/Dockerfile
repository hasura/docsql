
FROM oven/bun:latest
WORKDIR /app/server

COPY package.json bun.lock ./
RUN bun install

COPY . .

ENV NODE_ENV=production

ARG SERVER_PORT=4000
ARG PQL_API_KEY

ENV SERVER_PORT=${SERVER_PORT}
ENV PQL_API_KEY=${PQL_API_KEY}



EXPOSE ${SERVER_PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${SERVER_PORT}/ || exit 1

CMD ["bun", "src/index.ts"]
