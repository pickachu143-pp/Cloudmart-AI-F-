# CloudMart AI

**Enterprise e-commerce platform** built with React + TypeScript, Node.js + Express,
MongoDB / IBM Cloudant, and IBM Watson AI — containerized with Docker and
deployable on Kubernetes, with a full CI/CD pipeline.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white">
  <img alt="Kubernetes" src="https://img.shields.io/badge/Kubernetes-ready-326CE5?logo=kubernetes&logoColor=white">
</p>

## Features

- **Authentication** — JWT-based signup/login with httpOnly cookies + bearer token fallback
- **Product catalog** — search, category filters, sorting, pagination
- **Admin dashboard** — revenue stats, order breakdown, low-stock alerts
- **Product & category management** — full CRUD, inventory adjustment
- **Shopping cart & checkout** — simulated payment flow, tax/shipping calculation
- **Order tracking** — status timeline (pending → processing → shipped → delivered)
- **AI product recommendations** — powered by IBM Watson NLU, with a rule-based
  fallback so the feature always works, personalized or not
- **IBM Cloudant** — durable event log (views/purchases/searches) that feeds the
  recommendation engine, usable as the primary database too
- **Responsive UI** — mobile-first, Tailwind CSS
- **Dockerized** — multi-stage builds for both apps
- **Kubernetes manifests** — Deployments, Services, Ingress, ConfigMap, Secrets, HPA
- **CI/CD** — GitHub Actions: lint → typecheck → build → Docker push → K8s deploy

## Project Structure

```
CloudMart-AI/
├── frontend/               React + Vite + TypeScript SPA
│   └── src/
│       ├── components/     Reusable UI building blocks
│       ├── pages/          Route-level views (+ pages/admin)
│       ├── hooks/          useAuth, useCart, useDebounce
│       ├── services/       Axios API clients
│       ├── context/        AuthContext, CartContext
│       └── types/          Shared TypeScript types
│
├── backend/                Node.js + Express + TypeScript API
│   └── src/
│       ├── controllers/    Request handlers
│       ├── routes/         Express routers
│       ├── middleware/     auth, validation, error handling, rate limiting
│       ├── models/         Mongoose schemas
│       ├── config/         env, database, Cloudant, Watson config
│       ├── services/       Watson AI, Cloudant events, order logic
│       └── utils/          logger, ApiError/ApiResponse, JWT helpers, seed script
│
├── docker/                 Dockerfile.frontend, Dockerfile.backend, docker-compose.yml
├── kubernetes/             Deployments, Services, Ingress, ConfigMap, Secrets, HPA
├── nginx/                  nginx.conf (SPA + reverse proxy)
├── .github/workflows/      CI/CD pipeline (GitHub Actions)
└── docs/                   Architecture & API reference
```

## Quick Start (Docker Compose — recommended)

```bash
git clone <your-repo-url> CloudMart-AI
cd CloudMart-AI

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env with real secrets if you have IBM Cloud credentials

docker compose -f docker/docker-compose.yml up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api/health

Seed demo data (admin + customer accounts, categories, products):

```bash
docker exec -it cloudmart-backend npm run seed
```

Demo accounts after seeding:

| Role     | Email                | Password       |
|----------|-----------------------|----------------|
| Admin    | admin@cloudmart.ai    | Admin@12345    |
| Customer | customer@cloudmart.ai | Customer@123   |

## Local Development (without Docker)

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:5000
npm run seed        # optional demo data
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

## IBM Cloud Integration

- **IBM Cloudant** — set `CLOUDANT_URL` / `CLOUDANT_APIKEY` in `backend/.env`.
  Used for AI event logging always, and as the primary database when
  `DB_PROVIDER=cloudant`.
- **IBM Watson NLU** — set `WATSON_NLU_APIKEY` / `WATSON_NLU_URL` to power
  real AI-driven recommendations. Without credentials, the app automatically
  falls back to a rule-based (top-rated / same-category) recommender, so
  nothing breaks in local development.

## Kubernetes Deployment

```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml     # replace placeholder values first!
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml
```

See [`docs/README.md`](docs/README.md) for the full architecture diagram,
API reference, and deployment notes.

## Tech Stack

| Layer          | Technology                                   |
|-----------------|-----------------------------------------------|
| Frontend        | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend         | Node.js, Express, TypeScript                  |
| Database        | MongoDB (Mongoose) or IBM Cloudant            |
| AI              | IBM Watson Natural Language Understanding     |
| Auth            | JWT (httpOnly cookie + bearer token)          |
| Containerization| Docker, Docker Compose                        |
| Orchestration   | Kubernetes (Deployments, HPA, Ingress)        |
| CI/CD           | GitHub Actions                                |
| Web server      | Nginx (static hosting + reverse proxy)        |

## License

MIT
