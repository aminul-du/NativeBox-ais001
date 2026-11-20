# MCORE-SHORBORNO-MONOREPO-ARCH-001

Version: 1.0.0
Status: Architecture baseline / implementation verification pending
Authority: AIS

## Mission

Create an isolated, reproducible, DevOps-ready ShorbornoAI monorepo.

## Canonical root

/srv/mcore/shorbornoBD-NativeBox

## Architecture

- apps/: application services
- packages/: shared libraries and contracts
- ai/: AI providers, Workers AI adapters, agents and evaluation
- infra/cloudflare/: Cloudflare integration and infrastructure contracts
- infra/containers/: container infrastructure
- infra/environments/: environment-specific deployment configuration
- config/: canonical project configuration
- registry/: infrastructure and resource registries
- docs/: architecture and operational documentation
- scripts/: automation and validation
- backups/: local recovery artifacts
- evidence/: audit and production evidence

## Isolation

The monorepo is the canonical project boundary.
External repositories and files are not automatically imported.
Symlinks must be inspected before migration.
Secrets must never be copied into source control.
Remote Cloudflare resources remain remote services.

## Cloudflare invariants

- Preserve existing account and resource identities.
- Preserve both existing domains and their redirect relationship.
- No DNS modifications.
- No Tunnel recreation or modification.
- No unapproved Workers, Pages, D1 or KV changes.
- Workers AI executes remotely; local adapters and documentation
  belong in this repository.
- API inventory must distinguish verified, inaccessible and unknown.

## DevOps

- Reproducible builds
- CI validation
- Staging preflight
- Deployment plan and rollback documentation
- Evidence-backed production acceptance
- Human approval before production actions

## Governance

Architecture approval is not implementation verification.
Implementation verification is not production acceptance.
AIS retains final human authority.

## Current limitations

Existing application source, remote Cloudflare inventory,
deployment bindings and external file ownership must be reconciled
before claiming complete production readiness.
