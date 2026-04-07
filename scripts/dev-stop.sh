#!/bin/bash
# =============================================================================
# dev-stop.sh - Para todos os servicos (app + Supabase)
# Uso: bash scripts/dev-stop.sh
# =============================================================================

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Parando servicos do app...${NC}"
docker compose -f docker-compose.dev.yml down

echo -e "${GREEN}Parando Supabase...${NC}"
npx supabase stop

echo -e "${GREEN}Tudo parado.${NC}"
