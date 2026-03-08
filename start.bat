@echo off

:: CORREÇÃO 1: Removi as aspas daqui. Vamos usá-las apenas lá embaixo.
set BACKEND_PATH=C:\repos\ufrj\requirement-conjectural-multiagent\app-multi-agent-conjectural-assist
set FRONTEND_PATH=C:\repos\ufrj\requirement-conjectural-multiagent\app-multi-agent-conjectural-assist
set AGENT_PATH=C:\repos\ufrj\requirement-conjectural-multiagent\app-multi-agent-conjectural-assist\backend

:: CORREÇÃO 2: Estrutura do comando WT
:: Note o " ; ^" ao final das linhas. Isso diz ao terminal: "Execute isso E DEPOIS (;) continue na próxima linha do script (^)"
:: Adicionei um "echo" antes dos comandos para garantir feedback visual imediato.

wt ^
  -w 0 new-tab -d "%AGENT_PATH%" --title "Agente" cmd /k "echo Iniciando Agente (UV)... && uv run langgraph dev --port 8123 --no-browser" ; ^
  split-pane -V -d "%FRONTEND_PATH%" --title "Frontend" cmd /k "echo Iniciando Frontend (PNPM)... && pnpm dev:frontend" ; ^
  split-pane -H -d "%BACKEND_PATH%" --title "Backend" cmd /k "echo Iniciando Backend (PNPM)... && pnpm dev:backend"



::  -w 0 new-tab -d %BACKEND_PATH% --title "Backend" powershell -NoExit -Command "pnpm dev:backend" ; ^
::  split-pane -V -d %FRONTEND_PATH% --title "Frontend" powershell -NoExit -Command "pnpm dev:frontend" ; ^
::  split-pane -H -d %AGENT_PATH% --title "Agente" powershell -NoExit -Command "uv run langgraph dev --port 8123 --no-browser"
