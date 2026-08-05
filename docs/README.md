# Documentation

Standalone reference material for this project, separate from the narrative writeup in
[../ARCHITECTURE.md](../ARCHITECTURE.md) and the setup/deploy instructions in
[../README.md](../README.md).

| File / folder | What it is |
|---|---|
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Every MongoDB collection, its purpose, and why each relationship is embedded vs. referenced |
| [ER_DIAGRAM.md](./ER_DIAGRAM.md) | Entity-relationship diagram (Mermaid — renders natively on GitHub) |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Every REST endpoint, method, access level, and notes |
| [openapi.json](./openapi.json) | Generated OpenAPI 3.0 spec (same one that powers the live Swagger UI at `/docs` on the running backend) |
| [postman/](./postman/) | Postman collection + environment — import both and run top-to-bottom |

Source of truth for anything here is always the code (`backend/src/models/`, the `@openapi` JSDoc
comments in `backend/src/routes/` and `backend/src/controllers/`) — these files exist so you don't
have to read the code to get the same picture.
