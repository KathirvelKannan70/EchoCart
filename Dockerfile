FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install
RUN cd client && npm install
COPY . .
RUN npm run build
EXPOSE 5000
ENV PORT=5000
CMD ["npm", "start"]
