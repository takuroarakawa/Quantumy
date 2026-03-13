FROM rust:1.78-slim AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main(){}" > src/main.rs
RUN cargo build --release
COPY src ./src
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl bash && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/elementary-alert-handler /usr/local/bin/
COPY scripts /scripts
RUN chmod +x /scripts/*.sh
EXPOSE 8090
CMD ["elementary-alert-handler"]
