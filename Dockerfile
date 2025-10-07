# build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src/server

# copy csproj and restore
COPY ./server/server.csproj .
RUN dotnet restore

# copy everything else
COPY ./server/. .

# publish to /app/out
RUN dotnet publish -c Release -o /app/out

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "server.dll"]
