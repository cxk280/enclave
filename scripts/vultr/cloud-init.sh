#!/bin/bash
# Enclave — Vultr instance bootstrap (runs once on first boot).
# Installs Docker, builds the app image from the public repo, and serves it on :80.
# A swapfile lets the Next.js build succeed on a 1 GB instance.
set -euxo pipefail
exec > /var/log/enclave-bootstrap.log 2>&1

# --- swap (so `next build` doesn't OOM on a small box) ---
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --- Docker + git ---
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io git curl
systemctl enable --now docker

# --- build & run Enclave ---
rm -rf /opt/enclave
git clone --depth 1 https://github.com/cxk280/enclave.git /opt/enclave
cd /opt/enclave
docker build -t enclave:latest .
docker rm -f enclave 2>/dev/null || true
docker run -d --restart unless-stopped -p 80:3000 --name enclave enclave:latest

# --- readiness marker ---
for i in $(seq 1 30); do
  if curl -fsS http://localhost/api/health >/dev/null 2>&1; then
    echo "ENCLAVE_READY" > /var/log/enclave-ready
    break
  fi
  sleep 3
done
