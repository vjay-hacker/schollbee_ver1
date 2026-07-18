# ================================================================
# SchoolBee — Makefile
# Unified developer commands for the monorepo
# Usage: make <target>
# ================================================================

.PHONY: help dev dev-api dev-mobile build test lint typecheck clean \
        docker-dev docker-prod docker-build docker-push \
        k8s-apply k8s-delete k8s-status \
        db-backup db-restore db-migrate db-migrate-dry \
        logs logs-api logs-nginx \
        health status

# ── Default target ────────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

# ── Variables ─────────────────────────────────────────────────────────────────
IMAGE_TAG ?= latest
ENV ?= development
COMPOSE_FILE_DEV = docker/docker-compose.dev.yml
COMPOSE_FILE_PROD = docker/docker-compose.prod.yml
K8S_DIR = k8s
NAMESPACE = schoolbee

# Colors
CYAN = \033[36m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
RESET = \033[0m

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "$(CYAN)SchoolBee — Developer Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@echo "  make dev              Start full dev stack (API + Redis + Mailhog)"
	@echo "  make dev-api          Start API server only with hot reload"
	@echo "  make dev-mobile       Start Expo mobile dev server"
	@echo ""
	@echo "$(GREEN)Building:$(RESET)"
	@echo "  make build            Build all packages"
	@echo "  make build-api        Build API only"
	@echo "  make docker-build     Build Docker image"
	@echo "  make docker-push      Build and push to registry"
	@echo ""
	@echo "$(GREEN)Quality:$(RESET)"
	@echo "  make lint             Run ESLint across all packages"
	@echo "  make typecheck        Run TypeScript typecheck"
	@echo "  make test             Run all tests"
	@echo "  make test-api         Run API tests with coverage"
	@echo ""
	@echo "$(GREEN)Docker:$(RESET)"
	@echo "  make docker-dev       Start dev Docker stack"
	@echo "  make docker-prod      Start prod Docker stack"
	@echo "  make docker-down      Stop all containers"
	@echo "  make docker-clean     Remove containers and volumes"
	@echo ""
	@echo "$(GREEN)Kubernetes:$(RESET)"
	@echo "  make k8s-apply        Apply all K8s manifests"
	@echo "  make k8s-status       Show pod/service status"
	@echo "  make k8s-logs         Stream API pod logs"
	@echo "  make k8s-delete       Delete all SchoolBee K8s resources"
	@echo ""
	@echo "$(GREEN)Database:$(RESET)"
	@echo "  make db-migrate       Run pending Supabase migrations"
	@echo "  make db-migrate-dry   Preview migrations without applying"
	@echo "  make db-backup        Create database backup"
	@echo "  make db-restore FILE=<path>  Restore from backup"
	@echo ""
	@echo "$(GREEN)Monitoring:$(RESET)"
	@echo "  make logs             Stream all container logs"
	@echo "  make health           Check API health endpoint"
	@echo ""

# ── Development ───────────────────────────────────────────────────────────────
dev:
	@echo "$(CYAN)Starting SchoolBee dev stack...$(RESET)"
	docker compose -f $(COMPOSE_FILE_DEV) up

dev-api:
	@echo "$(CYAN)Starting API with hot reload...$(RESET)"
	pnpm --filter @schoolbee/api dev

dev-mobile:
	@echo "$(CYAN)Starting Expo dev server...$(RESET)"
	pnpm --filter @schoolbee/mobile start

install:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	pnpm install --frozen-lockfile

# ── Building ──────────────────────────────────────────────────────────────────
build:
	@echo "$(CYAN)Building all packages...$(RESET)"
	pnpm run build

build-api:
	@echo "$(CYAN)Building API...$(RESET)"
	pnpm --filter @schoolbee/shared-types build
	pnpm --filter @schoolbee/api build

# ── Quality ───────────────────────────────────────────────────────────────────
lint:
	@echo "$(CYAN)Running ESLint...$(RESET)"
	pnpm run lint

typecheck:
	@echo "$(CYAN)Running TypeScript typecheck...$(RESET)"
	pnpm run typecheck

test:
	@echo "$(CYAN)Running tests...$(RESET)"
	pnpm run test

test-api:
	@echo "$(CYAN)Running API tests with coverage...$(RESET)"
	pnpm --filter @schoolbee/api test:coverage

# ── Docker ────────────────────────────────────────────────────────────────────
docker-build:
	@echo "$(CYAN)Building Docker image (tag: $(IMAGE_TAG))...$(RESET)"
	docker build -t schoolbee/api:$(IMAGE_TAG) -f docker/Dockerfile.api .

docker-push: docker-build
	@echo "$(CYAN)Pushing to registry...$(RESET)"
	docker push schoolbee/api:$(IMAGE_TAG)

docker-dev:
	@echo "$(CYAN)Starting development containers...$(RESET)"
	docker compose -f $(COMPOSE_FILE_DEV) up -d
	@echo "$(GREEN)Dev stack running:$(RESET)"
	@echo "  API:         http://localhost:3001"
	@echo "  Redis GUI:   http://localhost:8081"
	@echo "  Mailhog:     http://localhost:8025"

docker-prod:
	@echo "$(CYAN)Starting production containers...$(RESET)"
	docker compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "$(GREEN)Production stack running$(RESET)"

docker-down:
	@echo "$(YELLOW)Stopping containers...$(RESET)"
	docker compose -f $(COMPOSE_FILE_DEV) down 2>/dev/null || true
	docker compose -f $(COMPOSE_FILE_PROD) down 2>/dev/null || true

docker-clean:
	@echo "$(RED)Removing containers and volumes...$(RESET)"
	docker compose -f $(COMPOSE_FILE_DEV) down -v 2>/dev/null || true
	docker compose -f $(COMPOSE_FILE_PROD) down -v 2>/dev/null || true

# ── Kubernetes ────────────────────────────────────────────────────────────────
k8s-apply:
	@echo "$(CYAN)Applying Kubernetes manifests...$(RESET)"
	kubectl apply -f $(K8S_DIR)/namespace.yaml
	kubectl apply -f $(K8S_DIR)/configmap.yaml
	kubectl apply -f $(K8S_DIR)/redis-statefulset.yaml
	kubectl apply -f $(K8S_DIR)/api-deployment.yaml
	kubectl apply -f $(K8S_DIR)/api-service.yaml
	kubectl apply -f $(K8S_DIR)/api-ingress.yaml
	kubectl apply -f $(K8S_DIR)/hpa.yaml
	@echo "$(GREEN)All manifests applied ✅$(RESET)"

k8s-status:
	@echo "$(CYAN)SchoolBee cluster status (namespace: $(NAMESPACE)):$(RESET)"
	@kubectl get pods,services,ingress,hpa -n $(NAMESPACE)

k8s-logs:
	@echo "$(CYAN)Streaming API pod logs...$(RESET)"
	kubectl logs -f -l app=schoolbee-api -n $(NAMESPACE) --all-containers=true

k8s-delete:
	@echo "$(RED)Deleting all SchoolBee K8s resources...$(RESET)"
	kubectl delete namespace $(NAMESPACE) --ignore-not-found

k8s-rollout-status:
	kubectl rollout status deployment/schoolbee-api -n $(NAMESPACE)

k8s-rollback:
	@echo "$(YELLOW)Rolling back API deployment...$(RESET)"
	kubectl rollout undo deployment/schoolbee-api -n $(NAMESPACE)

# ── Database ──────────────────────────────────────────────────────────────────
db-migrate:
	@echo "$(CYAN)Running Supabase migrations...$(RESET)"
	supabase db push

db-migrate-dry:
	@echo "$(CYAN)Previewing pending migrations...$(RESET)"
	supabase db diff

db-backup:
	@echo "$(CYAN)Creating database backup...$(RESET)"
	bash scripts/backup-db.sh

db-restore:
	@if [ -z "$(FILE)" ]; then echo "$(RED)Usage: make db-restore FILE=<path>$(RESET)"; exit 1; fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(RESET)"
	bash scripts/restore-db.sh $(FILE)

# ── Monitoring ────────────────────────────────────────────────────────────────
logs:
	docker compose -f $(COMPOSE_FILE_PROD) logs -f --tail=100

logs-api:
	docker compose -f $(COMPOSE_FILE_PROD) logs -f api-1 api-2 api-3

health:
	@echo "$(CYAN)Checking API health...$(RESET)"
	@curl -s http://localhost:3001/api/v1/health | python3 -m json.tool || curl -s http://localhost:3001/api/v1/health

status:
	@echo "$(CYAN)Container status:$(RESET)"
	@docker compose -f $(COMPOSE_FILE_PROD) ps 2>/dev/null || docker compose -f $(COMPOSE_FILE_DEV) ps

# ── Utility ───────────────────────────────────────────────────────────────────
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	find . -name "dist" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.tsbuildinfo" -exec rm -f {} + 2>/dev/null || true
	find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)Clean complete$(RESET)"

env-example:
	@echo "$(CYAN)Copying .env.example to .env.development...$(RESET)"
	@[ -f .env.development ] && echo "$(YELLOW).env.development already exists — skipping$(RESET)" || cp .env.example .env.development
