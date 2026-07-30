# CloudMart AI — Architecture & API Reference

## 1. System Architecture

```
                         ┌────────────────────┐
                         │       Client        │
                         │  (Browser / Mobile)  │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌────────────────────┐
                         │   Nginx / Ingress    │
                         │  (TLS, routing, SPA)  │
                         └──────────┬───────────┘
                        ┌───────────┴───────────┐
                        ▼                       ▼
              ┌───────────────────┐   ┌───────────────────┐
              │  Frontend (React)  │   │  Backend (Express)  │
              │  Static SPA build   │   │  REST API, JWT auth  │
              └───────────────────┘   └──────────┬────────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────────┐
                        ▼                          ▼                          ▼
              ┌──────────────────┐      ┌────────────────────┐      ┌────────────────────┐
              │  MongoDB / Mongoose │      │   IBM Cloudant        │      │   IBM Watson NLU     │
              │  Users, Products,    │      │  AI event log          │      │  Recommendation       │
              │  Orders, Carts        │      │  (views/purchases)      │      │  keyword extraction   │
              └──────────────────┘      └────────────────────┘      └────────────────────┘
```

**Request flow example — personalized recommendations:**

1. Client calls `GET /api/recommendations` with a JWT (cookie or bearer header).
2. `optionalAuth` middleware resolves the user if a valid token is present.
3. `recommendationController` pulls the user's recent activity from **IBM Cloudant**
   (`getRecentUserEvents`).
4. That activity is turned into a short text profile and sent to **IBM Watson NLU**
   (`watsonService.getRecommendations`) for keyword/concept extraction.
5. The product catalog (from MongoDB/Cloudant) is scored against those keywords.
6. Ranked recommendations are returned to the client.
7. If Watson or Cloudant are unavailable, the service transparently falls back to a
   rule-based "top rated" list — the endpoint never fails because of AI downtime.

## 2. Data Model Summary

| Model     | Key Fields                                                        |
|-----------|---------------------------------------------------------------------|
| User      | name, email, password (hashed), role (customer/admin), isActive     |
| Category  | name, slug, description, isActive                                   |
| Product   | name, description, price, category, stock, tags, ratingAverage      |
| Cart      | user, items[] (product, quantity, priceAtAdd)                       |
| Order     | orderNumber, user, items[], shippingAddress, paymentMethod,         |
|           | paymentStatus, status, statusHistory[], itemsTotal, tax, grandTotal |

## 3. REST API Reference

Base URL: `/api`

### Auth
| Method | Endpoint            | Auth  | Description                |
|--------|----------------------|-------|------------------------------|
| POST   | `/auth/register`      | Public | Create an account            |
| POST   | `/auth/login`          | Public | Log in, receive JWT          |
| POST   | `/auth/logout`         | Public | Clear auth cookie            |
| GET    | `/auth/me`             | Auth   | Get the current user          |

### Products
| Method | Endpoint                    | Auth   | Description                         |
|--------|-------------------------------|--------|----------------------------------------|
| GET    | `/products`                    | Public | List/search/filter/paginate products    |
| GET    | `/products/:id`                | Public | Get a single product                    |
| GET    | `/products/:id/similar`        | Public | Same-category "similar products"        |
| POST   | `/products`                    | Admin  | Create a product                        |
| PUT    | `/products/:id`                | Admin  | Update a product                        |
| DELETE | `/products/:id`                | Admin  | Soft-delete a product                   |
| PATCH  | `/products/:id/inventory`      | Admin  | Adjust stock level                      |

### Categories
| Method | Endpoint            | Auth   | Description        |
|--------|-----------------------|--------|-----------------------|
| GET    | `/categories`          | Public | List categories        |
| POST   | `/categories`          | Admin  | Create a category       |
| PUT    | `/categories/:id`      | Admin  | Update a category       |
| DELETE | `/categories/:id`      | Admin  | Delete a category       |

### Cart (auth required)
| Method | Endpoint                     | Description               |
|--------|---------------------------------|------------------------------|
| GET    | `/cart`                          | Get the current user's cart   |
| POST   | `/cart/items`                    | Add an item                   |
| PATCH  | `/cart/items/:productId`         | Update item quantity           |
| DELETE | `/cart/items/:productId`         | Remove an item                 |
| DELETE | `/cart`                          | Clear the cart                 |

### Orders (auth required)
| Method | Endpoint                | Description                          |
|--------|----------------------------|------------------------------------------|
| POST   | `/orders/checkout`          | Place an order from the current cart      |
| GET    | `/orders`                   | List the current user's orders            |
| GET    | `/orders/:id`                | Get a single order (owner or admin)        |
| GET    | `/orders/:id/track`          | Lightweight status/timeline view           |

### Recommendations
| Method | Endpoint            | Auth              | Description                            |
|--------|-----------------------|--------------------|--------------------------------------------|
| GET    | `/recommendations`     | Optional            | AI recommendations, personalized if logged in |

### Admin (admin role required)
| Method | Endpoint                     | Description                     |
|--------|---------------------------------|--------------------------------------|
| GET    | `/admin/dashboard`               | Aggregate stats for the dashboard     |
| GET    | `/admin/users`                   | List users                             |
| PATCH  | `/admin/users/:id/status`        | Activate/deactivate a user             |
| GET    | `/admin/orders`                  | List all orders, filterable by status  |
| PATCH  | `/admin/orders/:id/status`        | Update order status                    |

All responses follow the same envelope:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
}
```

Errors follow the same shape with `"success": false` and no `data`, e.g.:

```json
{ "success": false, "message": "Invalid email or password." }
```

## 4. Deployment Notes

- **Docker Compose** is intended for local development and demos — it spins up
  MongoDB, the backend, and the Nginx-served frontend on one bridge network.
- **Kubernetes** manifests assume a managed MongoDB/Cloudant in real production;
  the in-cluster `mongo` Deployment in `deployment.yaml` is provided for
  quick demo clusters and uses a single-replica `Recreate` strategy — swap it
  for a managed database before going to production.
- **Secrets** in `kubernetes/secrets.yaml` are placeholders. Regenerate them
  with `kubectl create secret generic ... --from-literal=KEY=value` or a
  proper secrets manager; never commit real values to source control.
- **CI/CD** (`.github/workflows/ci-cd.yml`) lints/typechecks/builds both apps
  on every push and PR, then — on `main` only — builds and pushes Docker
  images and rolls them out to the cluster via `kubectl set image`. It expects
  these repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`,
  `KUBE_CONFIG_DATA` (base64-encoded kubeconfig).

## 5. Extending the AI Layer

- Swap `watsonService.ts` to call a different Watson service (Discovery,
  Assistant) by changing the request payload and endpoint — the rest of the
  recommendation pipeline (scoring, fallback) is decoupled from Watson's
  specific API shape.
- `cloudantService.ts` is a thin, generic event logger — add new `type`
  values (e.g. `"cart_abandon"`, `"wishlist_add"`) without any schema
  migration, since Cloudant is schema-less.
