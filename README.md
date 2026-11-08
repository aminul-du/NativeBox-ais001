# NativeBox-ais001 — MCore One-Command Delivery

This repository is being initialized under **MCORE-ONECMD-DELIVERY-001**.

## Current state

- Initial repository bootstrap only.
- Application source and the reported `mcore-architecture.zip` have not yet been inspected or imported.
- No deployment has been performed.
- No Cloudflare resources, DNS records, KVM services, or paid resources have been provisioned or changed.

## Governance

AIS retains final authority for production deployment and acceptance. Architecture approval is not implementation verification or production acceptance.

## Intended delivery target

- Source of truth: GitHub
- Runtime: Debian 13 / KVM
- Edge: Cloudflare Tunnel for `ais.shorborno.ai`
- Application target: Next.js, FastAPI sandbox, Playwright orchestrator, PostgreSQL and Qdrant, subject to source inspection and compatibility verification.

## Next steps

1. Inspect and safely import the existing ZIP.
2. Audit required files and detect missing components.
3. Validate Docker Compose without starting services.
4. Add CI and security checks.
5. Build and test locally.
6. Deploy only after separate explicit AIS approval.
