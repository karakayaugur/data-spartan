FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/
RUN npm run install-packages
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
EXPOSE 3000
CMD ["node", "server/index.js"]
