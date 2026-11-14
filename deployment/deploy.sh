#!/usr/bin/env bash
set -Eeuo pipefail

: "${IMAGE_REF:?IMAGE_REF is required}"

AWS_REGION="eu-west-1"
ECR_REGISTRY="648632374176.dkr.ecr.eu-west-1.amazonaws.com"
DEPLOY_DIRECTORY="/opt/data-spartan/deploy"
COMPOSE_FILE="${DEPLOY_DIRECTORY}/compose.ec2.yml"
PREVIOUS_IMAGE=""
DEPLOY_STARTED=false

compose() {
  docker compose \
    --project-directory "${DEPLOY_DIRECTORY}" \
    -f "${COMPOSE_FILE}" "$@"
}

on_error() {
  exit_code=$?
  trap - ERR

  echo "Deployment failed."
  compose logs --no-color --tail=100 app || true

  if [[ "${DEPLOY_STARTED}" == true && -n "${PREVIOUS_IMAGE}" ]]; then
    echo "Restoring previous image: ${PREVIOUS_IMAGE}"
    export IMAGE_REF="${PREVIOUS_IMAGE}"

    if compose up -d --no-deps --force-recreate \
      --wait --wait-timeout 120 app; then
      echo "Rollback succeeded."
    else
      echo "ERROR: Rollback failed."
    fi
  fi

  exit "${exit_code}"
}

trap on_error ERR

test -f "${COMPOSE_FILE}"
export IMAGE_REF

aws ecr get-login-password --region "${AWS_REGION}" |
  docker login --username AWS --password-stdin "${ECR_REGISTRY}"

compose config --quiet

CURRENT_CONTAINER=$(compose ps --all --quiet app)
if [[ -n "${CURRENT_CONTAINER}" ]]; then
  PREVIOUS_IMAGE=$(docker inspect \
    --format '{{.Config.Image}}' "${CURRENT_CONTAINER}")
fi

docker pull "${IMAGE_REF}"

DEPLOY_STARTED=true
compose up -d --no-deps --force-recreate \
  --wait --wait-timeout 120 app

curl --fail --silent --show-error \
  --retry 5 --retry-connrefused --retry-delay 2 --max-time 5 \
  http://127.0.0.1:3000/health

echo
echo "Deployment succeeded: ${IMAGE_REF}"
compose ps
