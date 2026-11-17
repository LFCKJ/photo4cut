#!/usr/bin/env bash
# ==========================================================
# 오라클 클라우드 무료 티어 - SSL(HTTPS) 원클릭 발급 및 적용 스크립트
# 사용법:
#   chmod +x setup-ssl.sh
#   ./setup-ssl.sh <도메인 또는 IP.nip.io> <이메일>
# 예시:
#   ./setup-ssl.sh 123.45.67.89.nip.io myemail@gmail.com
# ==========================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ 사용법: ./setup-ssl.sh <도메인> <이메일>"
    echo "💡 도메인이 없다면 공인 IP를 이용해 무료 nip.io 도메인을 사용하세요:"
    echo "   예: ./setup-ssl.sh 152.67.123.45.nip.io user@example.com"
    exit 1
fi

echo "🚀 [1/4] Let's Encrypt 디렉터리 생성 및 Nginx(HTTP) 기동..."
mkdir -p certbot/conf certbot/www

# HTTP 전용 임시 Nginx 기동
docker compose up -d nginx backend

echo "⏳ [2/4] Let's Encrypt SSL 인증서 발급 진행 중 ($DOMAIN)..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
    echo "❌ SSL 인증서 발급에 실패했습니다. 오라클 수신 규칙(Ingress Rules 포트 80, 443)과 방화벽을 확인하세요."
    exit 1
fi

echo "⚙️ [3/4] Nginx SSL 설정 템플릿 적용..."
sed "s/DOMAIN_NAME/$DOMAIN/g" nginx/conf.d/ssl.conf.template > nginx/conf.d/default.conf

echo "🔄 [4/4] Nginx 재시작 및 HTTPS 활성화..."
docker compose restart nginx

echo "=========================================================="
echo "✅ 배포 및 SSL 적용 완료!"
echo "🌐 백엔드 HTTPS 주소: https://$DOMAIN"
echo "📌 Vercel 환경변수 VITE_API_BASE_URL 값으로 'https://$DOMAIN' 을 등록하세요."
echo "=========================================================="
