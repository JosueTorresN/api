FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Instalar dependencias necesarias
RUN apt-get update && \
    apt-get install -y curl gnupg2 && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> /root/.bashrc && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> /home/mssql/.bashrc

USER mssql
