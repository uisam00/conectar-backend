FROM node:22.19.0-alpine

# Instalar dependências do sistema
RUN apk add --no-cache bash

# Instalar dependências globais para build
RUN npm i -g @nestjs/cli typescript ts-node

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Limpar dependências de desenvolvimento após build
RUN npm uninstall -g @nestjs/cli typescript ts-node

# Expor porta (Railway usa PORT automático)
EXPOSE 3000

# Comando para ambiente de teste
CMD ["npm", "run", "start:prod"]
