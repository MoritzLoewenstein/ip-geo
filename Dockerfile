FROM node:24.11-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG IP_SOURCE=forwarded_for
ENV IP_SOURCE=${IP_SOURCE}
EXPOSE 3000
CMD ["node", "index.ts"]