FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Directory.Packages.props .
COPY GraffyApi/GraffyApi.csproj GraffyApi/
COPY GraffyApi.Application/GraffyApi.Application.csproj GraffyApi.Application/
COPY GraffyApi.Contracts/GraffyApi.Contracts.csproj GraffyApi.Contracts/
COPY GraffyApi.Domain/GraffyApi.Domain.csproj GraffyApi.Domain/
RUN dotnet restore GraffyApi/GraffyApi.csproj
COPY . .
RUN dotnet publish GraffyApi/GraffyApi.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "GraffyApi.dll"]
