# Cloudflare integration boundary

Target hostname: ais.shorborno.ai

Design target only: no tunnel, DNS record, Access policy or public route has been created by this repository bootstrap.

- Prefer a remotely managed Cloudflare Tunnel with a narrowly scoped hostname route.
- Keep the tunnel token outside Git and build arguments.
- Keep PostgreSQL, Qdrant, Docker API and administration endpoints off public ingress.
- Route only the intended web service; use Access for private administration.
- Confirm the zone and hostname are controlled by the account owner before DNS changes.
- Verify tunnel health before production routing.
- Separate staging and production routes and credentials.

Official setup: https://developers.cloudflare.com/tunnel/get-started/
