FROM node:24.11-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

ARG IP_SOURCE=forwarded_for
ENV IP_SOURCE=${IP_SOURCE}
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.ts"]