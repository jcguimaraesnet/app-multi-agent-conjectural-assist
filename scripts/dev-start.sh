#!/bin/bash
# =============================================================================
# dev.sh - Inicia todas as 4 partes do app: Supabase + Frontend + Backend + Agent
# Uso: bash scripts/dev.sh
# =============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== SMA Conjectural Assist — Dev Environment ===${NC}"

# ---------------------------------------------------------------------------
# 1. Docker
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[1/3] Verificando Docker...${NC}"
if ! docker info &>/dev/null; then
    echo "Iniciando Docker..."
    sudo service docker start
    sleep 2
    if ! docker info &>/dev/null; then
        echo -e "${RED}Erro: Docker nao iniciou. Verifique a instalacao.${NC}"
        exit 1
    fi
fi
echo "Docker OK."

# ---------------------------------------------------------------------------
# 2. Supabase
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[2/3] Verificando Supabase...${NC}"
if docker ps --format '{{.Names}}' | grep -q "supabase_db"; then
    echo -e "${YELLOW}Supabase ja esta rodando.${NC}"
else
    echo "Iniciando Supabase (pode demorar na primeira vez)..."
    npx supabase start
fi

# ---------------------------------------------------------------------------
# 3. App services (build + up)
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[3/3] Iniciando Frontend + Backend + Agent...${NC}"
echo ""
echo "  Frontend:         http://localhost:3000"
echo "  Backend (docs):   http://localhost:8000/docs"
echo "  Agent Studio:     http://localhost:8123"
echo "  Supabase Studio:  http://localhost:54323"
echo "  Inbucket (email): http://localhost:54324"
echo "  Elasticsearch:    http://localhost:9200"
echo "  Kibana:           http://localhost:5601"
echo ""

docker compose -f docker-compose.dev.yml up --build
