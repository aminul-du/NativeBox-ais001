.PHONY: audit compose-validate preflight

audit:
	bash scripts/audit-repo.sh

compose-validate:
	bash scripts/validate-compose.sh .env.example

preflight:
	bash scripts/deploy.sh --preflight
