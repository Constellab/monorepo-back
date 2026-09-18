#!/bin/bash
#
# Prepares a bare Ubuntu machine for a Constellab CapRover instance.
# Step 2 of NEW_INSTANCE.md, in one command.
#
# Does: system update, UTC clock, swap, Docker CE, automatic security upgrades, and
# the directories bind-mounted into space-api and community-api.
#
# Docker is a PREREQUISITE of CapRover, not something CapRover installs. Its docs ask
# for official Docker CE and warn against the snap package, so that is what this
# installs, from Docker's own apt repository.
#
# Copy it over and run it as the normal user, not as root:
#   scp caprover/prepare-machine.sh ubuntu@<IP>:~
#   ssh ubuntu@<IP> 'bash ~/prepare-machine.sh'
#
# Safe to re-run: every step checks its own state first.
#
set -euo pipefail

# swapon and mkswap live in /usr/sbin, which is not on every distribution's user PATH.
# Without this the swap check reports "no swap" whatever the machine actually has.
PATH="$PATH:/usr/sbin:/sbin"

# Ubuntu only. The Docker repository path, the unattended-upgrades origins and the ESM
# suites below are all Ubuntu-specific, and a wrong guess fails late and confusingly
# rather than here.
. /etc/os-release
if [ "${ID:-}" != "ubuntu" ]; then
    echo "ERROR: this installs Ubuntu only, and found '${ID:-unknown}'." >&2
    echo "       Reinstall the machine with Ubuntu Server LTS and run this again." >&2
    exit 1
fi
CODENAME="${VERSION_CODENAME:?os-release has no VERSION_CODENAME}"
echo "Distribution: ubuntu $CODENAME"

if [ "$(id -u)" = "0" ]; then
    echo "Run this as the normal user (it calls sudo itself). Running it as root would" >&2
    echo "create the bind-mount directories under /root instead of the user's home." >&2
    exit 1
fi

SWAP_FILE="/swapfile"
SWAP_SIZE="2G"

echo "=== System update ==="
sudo apt-get -y update
sudo apt-get -y upgrade

echo "=== Clock ==="
# CapRover, the APIs and the backup cron all assume UTC.
sudo timedatectl set-timezone UTC
timedatectl show --property=Timezone --value

echo "=== Swap ==="
# The stack fits in 4 GB but with little headroom. Only create swap if the machine
# has none: a provider-managed swap partition is fine and must not be doubled.
if [ "$(swapon --show --noheadings | wc -l)" -gt 0 ]; then
    echo "swap already active, leaving it alone:"
    swapon --show
elif [ -e "$SWAP_FILE" ]; then
    echo "$SWAP_FILE already exists but is not active, leaving it alone." >&2
else
    sudo fallocate -l "$SWAP_SIZE" "$SWAP_FILE"
    sudo chmod 600 "$SWAP_FILE"
    sudo mkswap "$SWAP_FILE"
    sudo swapon "$SWAP_FILE"
    # grep on the exact field so a commented or differently-sized entry is not matched
    if ! awk '{print $1}' /etc/fstab | grep -qx "$SWAP_FILE"; then
        echo "$SWAP_FILE none swap sw 0 0" | sudo tee -a /etc/fstab > /dev/null
    fi
    echo "created $SWAP_SIZE of swap."
fi

echo "=== Docker ==="
# CapRover requires Docker and does not install it. Ubuntu's own `docker.io` package
# and the snap both cause trouble with Swarm; CapRover's docs ask for Docker CE 25+
# from Docker's repository.
if command -v snap > /dev/null && snap list docker > /dev/null 2>&1; then
    echo "ERROR: docker is installed as a snap. CapRover does not support it." >&2
    echo "       Remove it (sudo snap remove docker) and re-run this script." >&2
    exit 1
fi

if command -v docker > /dev/null && sudo docker info > /dev/null 2>&1; then
    echo "docker already installed: $(docker --version)"
else
    sudo apt-get -y install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $CODENAME stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get -y update
    sudo apt-get -y install docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "docker installed: $(docker --version)"
    echo "NOTE: log out and back in before running docker without sudo."
fi

DOCKER_MAJOR="$(sudo docker version --format '{{.Server.Version}}' 2> /dev/null | cut -d. -f1 || true)"
if [ -n "$DOCKER_MAJOR" ] && [ "$DOCKER_MAJOR" -lt 25 ] 2> /dev/null; then
    echo "WARNING: Docker $DOCKER_MAJOR is older than the 25+ CapRover asks for." >&2
fi

echo "=== Automatic security upgrades ==="
sudo apt-get -y install unattended-upgrades apt-listchanges

# ${distro_codename} is expanded by unattended-upgrades itself, so the file stays
# correct across a release upgrade instead of pinning the codename of install day.
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

// Remove unused automatically installed kernel-related packages
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";

// Remove unused dependencies after upgrade
Unattended-Upgrade::Remove-Unused-Dependencies "true";

// Never reboot on its own. A reboot drops every container at once, including the
// two databases; it is scheduled by hand instead. Check /var/run/reboot-required.
Unattended-Upgrade::Automatic-Reboot "false";

// Optional mail notification
// Unattended-Upgrade::Mail "admin@example.com";
// Unattended-Upgrade::MailReport "on-change";
EOF

sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Let needrestart restart services without prompting, or an unattended run hangs.
if dpkg -l | grep -q needrestart; then
    sudo sed -i "s/^\$nrconf{restart}.*$/\$nrconf{restart} = 'a';/" \
        /etc/needrestart/needrestart.conf 2>/dev/null || true
fi

sudo systemctl enable --now apt-daily.timer
sudo systemctl enable --now apt-daily-upgrade.timer
sudo unattended-upgrades --dry-run --debug 2>&1 | tail -5

echo "=== Directories bind-mounted into the apps ==="
# These are the bind mounts of space-api and community-api. Swarm does not create a
# missing bind source: it rejects the task, rolls back to the previous image, and the app
# silently keeps running whatever it ran before. So the directories come first, and the
# configuration file has to point at exactly these paths.
mkdir -p "$HOME/space-api-volume" "$HOME/logs/space-api" "$HOME/logs/community-api"
ls -ld "$HOME/space-api-volume" "$HOME/logs/space-api" "$HOME/logs/community-api"
echo
echo "Put this in the vars block of caprover-apps.<customer>.json, step 5:"
echo "    \"HOST_HOME\": \"$HOME\","

echo
echo "Done. Security patches install daily, and the machine never reboots on its own."
echo "  reboot needed?  [ -f /var/run/reboot-required ] && cat /var/run/reboot-required"
echo "  timer status    systemctl status apt-daily-upgrade.timer"
echo "  upgrade log     sudo cat /var/log/unattended-upgrades/unattended-upgrades.log"
echo
echo "Next: step 3 — open the firewall, then start the CapRover container."
