# Check out https://hub.docker.com/_/node to select a new base image
FROM node:20.20-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build:${SERVICE}

# Bind to all network interfaces so that it can be mapped to the host OS

# Запуск prisma generate
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE ${PORT}

CMD ["sh", "-c", "npx prisma migrate deploy --config=apps/api/prisma/prisma.config.ts && exec npm run start:api"]
