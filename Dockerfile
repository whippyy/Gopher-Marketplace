# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY ./server ./server
WORKDIR /app/server
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/server/out ./
ENTRYPOINT ["sh", "-c", "echo 'Listing /app:' && ls -l /app && echo 'Listing /etc/secrets:' && ls -l /etc/secrets && dotnet server.dll"]