# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY ./server/*.csproj ./server/
RUN dotnet restore ./server/server.csproj

# copy everything else
COPY ./server ./server

# set workdir into project folder
WORKDIR /src/server

# publish to /app/out
RUN dotnet publish -c Release -o /app/out

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "server.dll"]
