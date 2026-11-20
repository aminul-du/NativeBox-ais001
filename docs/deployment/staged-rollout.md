# MCore staged rollout — MCORE-ONECMD-DELIVERY-001

## Current gate
Repository bootstrap only. The ZIP has not been inspected/imported. No deployment is authorized.

## Stage 0 — Preserve and inspect
- Preserve the ZIP unchanged and record SHA-256.
- List archive contents before extraction.
- Reject absolute paths, parent traversal and symlinks escaping extraction root.
- Extract into a new review directory; never overwrite existing files.
- Compare archive contents with repository paths and generate a missing-file report.

## Stage 1 — Static audit
- Run scripts/audit-repo.sh and scripts/validate-compose.sh .env.example.
- Inspect Dockerfiles, dependency lockfiles, container users, ports, volumes and health checks.
- Verify PostgreSQL and Qdrant are not published on host interfaces.
- Scan for secrets and vulnerable dependencies.

## Stage 2 — Local build and tests
- Build images without starting production services.
- Run tests in isolation.
- Verify Python/Node versions from manifests and lockfiles.
- Verify Playwright browser dependencies and sandbox isolation.
- Record commit SHA, image digests and test results.

## Stage 3 — Staging
- Use separate staging environment, credentials and tunnel.
- Require explicit approval before starting containers or changing network state.
- Keep databases private and production hostname unchanged.
- Validate health, authentication, authorization, logs and backups.

## Stage 4 — Production approval
AIS must explicitly approve the exact release commit, affected services, hostname, rollback plan and cost implications. Approval for one release does not authorize future releases or paid provisioning.

## Stage 5 — Production verification
- Verify tunnel health and hostname routing.
- Verify application health externally.
- Verify access controls and no unintended database exposure.
- Test backup restoration and rollback.
- Store redacted evidence and record AIS acceptance separately.

## Rollback
Use a previously tested release by immutable commit/image digest. Database migrations require a documented compatibility or restore plan; do not blindly roll back persistent data.
