# PipelineGen Monorepo Test Project

A multi-language monorepo with three services:

| Package | Language | Framework | Role |
|---------|----------|-----------|------|
| `frontend/` | Node.js | Express | REST API gateway + serving |
| `backend/` | Python | Django | Core business logic API |
| `services/mailer/` | PHP | Laravel | Email/notification service |

## Structure
```
monorepo/
├── frontend/        # Node.js + Express (API gateway)
├── backend/         # Python + Django (core API)
├── services/
│   └── mailer/      # PHP + Laravel (mailer service)
└── docker-compose.yml
```
