.PHONY: build run stop logs health
build:
	docker compose -f deployment/compose.prod.yml build
run:
	docker compose -f deployment/compose.prod.yml up -d
stop:
	docker compose -f deployment/compose.prod.yml down
logs:
	docker compose -f deployment/compose.prod.yml logs -f
health:
	curl --fail http://localhost:3001/health
