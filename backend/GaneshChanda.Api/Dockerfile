FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["GaneshChanda.Api.csproj", "./"]
RUN dotnet restore "GaneshChanda.Api.csproj"

COPY . .
RUN dotnet publish "GaneshChanda.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "GaneshChanda.Api.dll"]