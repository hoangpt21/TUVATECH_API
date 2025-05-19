FROM node:18-alpine

WORKDIR /tuvatech/backend

COPY package*.json ./

RUN npm install
RUN npm install -g @babel/core @babel/cli

COPY . .

RUN npm run build
CMD ["npm", "run", "production"]
