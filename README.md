# Order Management

## Prerequisites
- Docker

## How to run:
```
docker-compose -f docker-compose.yml up --build
```

## Components
- #### Order Service:
    - Run on port 3001 and expose port 3001.
    - APIs
        - ```GET /orders```
        - ```POST /orders```
        - ```GET /orders/:orderId```
        - ```GET /orders/:orderId/status```
        - ```POST /orders/:orderId/cancel```
- #### Payment Service:
    - Run on port 3002 and expose port 3002.
- #### Redis:
    - Run on port 6379 and expose port 6379.
    - Act as message broker.
    
## Pending Issues:
- At very first time running Docker, mariaDB costs time to initialize an instance while those services get started without waiting their dependencies. In order to workaround, please stop and restart the containers.
- No deployment on any Cloud.
