# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Use the official .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Sever.csproj", "."]
RUN dotnet restore "Sever.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "Sever.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Sever.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Sever.dll"]
