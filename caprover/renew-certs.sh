#!/bin/bash
#
# Renouvellement des certificats Let's Encrypt gérés MANUELLEMENT sur CapRover
# via le plugin dns-ovh.
#
# IMPORTANT : ce script ne touche QUE les lignées listées dans CERT_NAMES.
# Les certificats gérés par CapRover (authenticator webroot) sont volontairement
# ignorés : CapRover les renouvelle tout seul, et ils échoueraient ici puisque
# le volume /captain-webroot n'est pas monté.
#
# Appelé deux fois par jour par cron. certbot renew ne fait rien tant qu'il
# reste plus de 30 jours de validité.
#
# Usage :
#   ./renew-certs.sh              renouvellement réel
#   ./renew-certs.sh --dry-run    test contre le serveur de staging
#
set -euo pipefail

# --- Configuration -----------------------------------------------------------
# Attention : CapRover écrit "letencrypt" (sans le "s"), c'est bien le chemin
# réel sur le serveur.
LE_ETC="/captain/data/letencrypt/etc"
LE_LIB="/captain/data/letencrypt/lib"
OVH_CREDENTIALS="/home/ubuntu/ovh.ini"
NGINX_SERVICE="captain-nginx"
IMAGE="certbot/dns-ovh"

# Les seules lignées à renouveler ici. Doivent correspondre exactement aux
# "Certificate Name" retournés par `certbot certificates`.
CERT_NAMES=(
    "constellab.space"
    "api.constellab.space"
)

# Fichier témoin écrit par le deploy-hook depuis l'intérieur du conteneur.
# Vu du conteneur : /etc/letsencrypt/.renewed
# Vu de l'hôte    : $LE_ETC/.renewed
FLAG_IN_CONTAINER="/etc/letsencrypt/.renewed"
FLAG_ON_HOST="${LE_ETC}/.renewed"

# --- Vérifications préalables ------------------------------------------------
for path in "$LE_ETC" "$LE_LIB"; do
    if [ ! -d "$path" ]; then
        echo "ERREUR : $path est introuvable. Chemin des volumes CapRover à verifier." >&2
        exit 1
    fi
done

if [ ! -f "$OVH_CREDENTIALS" ]; then
    echo "ERREUR : credentials OVH introuvables ($OVH_CREDENTIALS)." >&2
    exit 1
fi

# On repart d'un etat propre au cas ou une execution precedente se serait
# interrompue entre le hook et le rechargement de nginx.
rm -f "$FLAG_ON_HOST"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') : demarrage du renouvellement ==="

# --- Renouvellement ----------------------------------------------------------
# Une invocation par lignee : --cert-name n'accepte qu'une valeur a la fois.
# Le deploy-hook ne s'execute que si le certificat a reellement ete renouvele.
# Il tourne DANS le conteneur (pas de docker CLI disponible), on se contente
# donc d'y poser un temoin que l'hote lira ensuite.
for cert_name in "${CERT_NAMES[@]}"; do
    if [ ! -d "${LE_ETC}/live/${cert_name}" ]; then
        echo "AVERTISSEMENT : lignee '${cert_name}' inconnue, ignoree." >&2
        continue
    fi

    echo "--- Traitement de ${cert_name}"
    docker run --rm \
        -v "${LE_ETC}:/etc/letsencrypt" \
        -v "${LE_LIB}:/var/lib/letsencrypt" \
        -v "${OVH_CREDENTIALS}:/ovh.ini:ro" \
        "$IMAGE" renew \
            --cert-name "$cert_name" \
            --dns-ovh-credentials /ovh.ini \
            --dns-ovh-propagation-seconds 120 \
            --deploy-hook "echo \"\$RENEWED_LINEAGE renouvele\"; touch ${FLAG_IN_CONTAINER}" \
            --non-interactive \
            --no-random-sleep-on-renew \
            "$@"
done

# --- Rechargement de nginx ---------------------------------------------------
if [ -f "$FLAG_ON_HOST" ]; then
    echo "Au moins un certificat a ete renouvele, rechargement de ${NGINX_SERVICE}..."
    rm -f "$FLAG_ON_HOST"
    docker service update --force "$NGINX_SERVICE"
    echo "nginx recharge."
else
    echo "Aucun certificat renouvele, nginx laisse en place."
fi

echo "=== $(date '+%Y-%m-%d %H:%M:%S') : termine ==="
