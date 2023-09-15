FROM redis:6.0.1-alpine

CMD ["sh", "-c", "exec redis-server --requirepass \"$REDIS_PASSWORD\""]