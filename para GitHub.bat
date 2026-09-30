@echo off
chcp 65001 >nul
title Enviar Salão da Bianca para GitHub

cd /d "%~dp0"
cls

echo.
echo  ============================================================
echo   BIANCA ALVES SALAO DE BELEZA
echo   Enviando projeto para o GitHub
echo   Repositorio: salao-da-bianca-studio
echo  ============================================================
echo.

REM --- VERIFICA GIT ---
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo  [ERRO] Git nao encontrado!
  echo.
  echo  Abra o PowerShell e cole o comando abaixo para instalar:
  echo.
  echo  winget install --id Git.Git --accept-source-agreements --accept-package-agreements -h
  echo.
  echo  Depois de instalar, FECHA TUDO, abre de novo e clica aqui.
  echo.
  pause
  exit /b 1
)

REM --- REMOVE GIT ANTIGO SE EXISTIR (evita conflitos) ---
if exist ".git" (
  echo  [!] Removendo repositorio Git antigo para evitar erros...
  rmdir /s /q .git 2>nul
)

echo  [1/7] Inicializando Git...
git init >nul
git branch -M main

echo  [2/7] Conectando ao seu GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/sandroluis10k-cell/salao-da-bianca-studio.git

REM --- CONFIGURA USUARIO (se nao existir) ---
for /f "delims=" %%i in ('git config user.name 2^>nul') do set GNAME=%%i
if "%GNAME%"=="" (
  echo  [3/7] Configurando usuario do GitHub...
  git config user.name "sandroluis10k-cell"
  git config user.email "79788000+sandroluis10k-cell@users.noreply.github.com"
) else (
  echo  [3/7] Usuario Git ja configurado.
)

echo  [4/7] Adicionando arquivos...
git add .

echo  [5/7] Criando commit inicial...
git commit -m "Site oficial Bianca Alves Salao de Beleza - commit inicial" >nul

echo  [6/7] Sincronizando com o GitHub...
git pull --rebase origin main >nul 2>&1

echo  [7/7] Enviando arquivos (push)...
git push -u origin main 2>&1

echo.
if %ERRORLEVEL% EQU 0 (
  echo  ============================================================
  echo   ^^ SUCESSO! Tudo enviado.
  echo   Link do repositorio:
  echo   https://github.com/sandroluis10k-cell/salao-da-bianca-studio
  echo  ============================================================
  echo.
  timeout /t 2 >nul
  start "" "https://github.com/sandroluis10k-cell/salao-da-bianca-studio"
) else (
  echo  ============================================================
  echo   OCORREU UM ERRO.
  echo  ============================================================
  echo.
  echo   Possiveis causas:
  echo   - O repositorio no GitHub NAO ESTA VAZIO (tem README ou .gitignore criado por cima)
  echo   - Credenciais de login Git nao foram autorizadas
  echo.
  echo   Solucao mais facil:
  echo   1. Delete o repositorio "salao-da-bianca-studio" no GitHub
  echo   2. Crie um NOVO repositorio VAZIO (sem NADA marcado)
  echo   3. Atualize a URL dentro deste arquivo .bat
  echo   4. Clique de novo aqui.
  echo.
)
echo.
pause