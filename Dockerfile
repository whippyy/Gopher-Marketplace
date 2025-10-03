# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY ./server ./server

# Copy csproj and restore as distinct layers to leverage caching
WORKDIR /app/server
COPY ./server/*.csproj .
RUN dotnet restore 

# Copy everything else and publish
COPY . .
RUN dotnet publish server.csproj -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/server/out ./
ENTRYPOINT ["dotnet", "server.dll"]