#!/usr/bin/env bash
# ==========================================================
# 오라클 클라우드 Ubuntu 인스턴스 초기화 및 Docker 설치 스크립트
# 사용법:
#   chmod +x setup-oracle.sh
#   ./setup-oracle.sh
# ==========================================================

set -e

echo "🔧 [1/4] 시스템 패키지 업데이트..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release iptables-persistent

echo "🔓 [2/4] 오라클 기본 iptables 방화벽 규칙 개방 (포트 80, 443, 8080 허용)..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save

echo "🐳 [3/4] Docker & Docker Compose 최신 버전 설치..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
fi

echo "✅ [4/4] 환경 준비 완료!"
echo "⚠️ docker 명령어를 sudo 없이 실행하려면 세션을 재접속(exit 후 재로그인)해주세요."
echo ""
echo "다음 단계:"
echo "1. .env 파일 생성 (GEMINI_API_KEY 입력)"
echo "2. ./setup-ssl.sh <도메인> <이메일> 실행"
