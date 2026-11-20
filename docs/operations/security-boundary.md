# Security and Isolation Boundary

- Canonical repository: /srv/mcore/shorbornoBD-NativeBox
- External project files are not automatically imported.
- Symlinks are not followed during migration.
- .env files and private credentials must remain outside Git.
- Never place API tokens in YAML, Markdown or shell history.
- Remote Cloudflare configuration is represented by verified exports.
- No automatic DNS, Tunnel, deployment or billing operations.
- Every migration requires source, destination and integrity evidence.
- Backups must precede approved migration.
