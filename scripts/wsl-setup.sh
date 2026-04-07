#!/bin/bash
# =============================================================================
# wsl-setup.sh - Setup unico do ambiente WSL2 para desenvolvimento
# Executar uma vez apos instalar o WSL2 com Ubuntu 24.04
# Uso: bash scripts/wsl-setup.sh
# =============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== SMA Conjectural Assist - WSL2 Setup ===${NC}\n"

# ---------------------------------------------------------------------------
# 1. Docker Engine
# ---------------------------------------------------------------------------
echo -e "${GREEN}[1/5] Instalando Docker Engine...${NC}"
if command -v docker &>/dev/null; then
    echo -e "${YELLOW}Docker ja esta instalado: $(docker --version)${NC}"
else
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    sudo usermod -aG docker "$USER"
    echo -e "${YELLOW}IMPORTANTE: Faca logout e login no WSL para o grupo docker ter efeito.${NC}"
fi

# ---------------------------------------------------------------------------
# 2. Node.js 20 + pnpm
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[2/5] Instalando Node.js 20 + pnpm...${NC}"
if command -v node &>/dev/null && node -v | grep -q "v20"; then
    echo -e "${YELLOW}Node.js ja esta instalado: $(node -v)${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if command -v pnpm &>/dev/null; then
    echo -e "${YELLOW}pnpm ja esta instalado: $(pnpm -v)${NC}"
else
    sudo npm install -g pnpm
fi

# ---------------------------------------------------------------------------
# 3. Supabase CLI
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[3/5] Instalando Supabase CLI...${NC}"
if command -v supabase &>/dev/null; then
    echo -e "${YELLOW}Supabase CLI ja esta instalado: $(supabase --version)${NC}"
else
    sudo npm install -g supabase
fi

# ---------------------------------------------------------------------------
# 4. Python 3.12 + uv
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[4/5] Verificando Python 3.12 + uv...${NC}"
if command -v python3.12 &>/dev/null || python3 --version 2>/dev/null | grep -q "3.12"; then
    echo -e "${YELLOW}Python 3.12 ja esta instalado: $(python3 --version)${NC}"
else
    echo "Instalando Python 3.12..."
    sudo apt-get install -y software-properties-common
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt-get update
    sudo apt-get install -y python3.12 python3.12-venv python3.12-dev
fi

if command -v uv &>/dev/null; then
    echo -e "${YELLOW}uv ja esta instalado: $(uv --version)${NC}"
else
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

# ---------------------------------------------------------------------------
# 5. Configurar systemd (auto-start Docker)
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}[5/5] Verificando systemd...${NC}"
if grep -q "systemd=true" /etc/wsl.conf 2>/dev/null; then
    echo -e "${YELLOW}systemd ja esta habilitado.${NC}"
else
    echo "Habilitando systemd no WSL..."
    sudo bash -c 'cat >> /etc/wsl.conf << EOF

[boot]
systemd=true
EOF'
    echo -e "${YELLOW}IMPORTANTE: Execute 'wsl --shutdown' no PowerShell e reabra o WSL.${NC}"
fi

# ---------------------------------------------------------------------------
# Resumo
# ---------------------------------------------------------------------------
echo -e "\n${GREEN}=== Setup concluido! ===${NC}"
echo ""
echo "Proximos passos:"
echo "  1. Faca logout/login no WSL (para grupo docker)"
echo "  2. Clone o repo no filesystem nativo do WSL:"
echo "     mkdir -p ~/projects"
echo "     git clone <repo-url> ~/projects/app-multi-agent-conjectural-assist"
echo "  3. Configure os env files:"
echo "     cp .env.local.example .env.local"
echo "     cp backend/.env.example backend/.env"
echo "  4. Inicie o Supabase e pegue as keys:"
echo "     npx supabase start"
echo "     npx supabase status -o env"
echo "  5. Aplique migrations:"
echo "     npx supabase db reset"
echo "  6. Inicie tudo:"
echo "     bash scripts/dev.sh"
