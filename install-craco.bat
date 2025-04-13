@echo off
echo Instalando CRACO...
call yarn add -D @craco/craco

echo Atualizando scripts no package.json...
call powershell -Command "(Get-Content package.json) -replace '\"start\": \"react-scripts start\"', '\"start\": \"craco start\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"build\": \"react-scripts build\"', '\"build\": \"craco build\"' | Set-Content package.json"
call powershell -Command "(Get-Content package.json) -replace '\"test\": \"react-scripts test\"', '\"test\": \"craco test\"' | Set-Content package.json"

echo Configuracao do CRACO concluida! 