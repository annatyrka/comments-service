FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install

# Copy everything else
COPY ./ ./

CMD ["npm", "start"]