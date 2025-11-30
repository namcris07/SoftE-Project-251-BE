FROM node:20-alpine
WORKDIR /app

COPY . .
RUN npm install --production

ENTRYPOINT ["npm", "run", "dev"]

EXPOSE 3000
