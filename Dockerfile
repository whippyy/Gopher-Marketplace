# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./server/*.csproj ./server/
WORKDIR /app/server
RUN dotnet restore

# Copy everything else and publish
COPY ./server ./server
RUN dotnet publish server.csproj -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/server/out ./
ENTRYPOINT ["dotnet", "server.dll"]
