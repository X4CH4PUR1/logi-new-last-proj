#!/bin/bash
# Run by cPanel's Git Version Control when you press "Deploy HEAD Commit".
# See .cpanel.yml, which does nothing but call this file.
#
# Everything this prints is copied to public_html/deploy-log.txt as the very
# last thing it does, whether it succeeded or failed. So
# https://www.logimotors.com/deploy-log.txt answers the question a silent
# deploy cannot: did these tasks run at all, and what did they see?

set -u

# cPanel > Domains reports /public_html as the document root for
# logimotors.com. Set this if that ever stops being true.
OVERRIDE=""

log() { echo "[deploy] $*"; }

main() {
  cd "$(dirname "$0")/.." || exit 1
  REPO="$(pwd)"

  log "started $(date -u)"
  log "user    $(whoami)"
  log "home    $HOME"
  log "repo    $REPO"
  log "commit  $(git log -1 --format='%h %s')"

  log "--- $HOME ---"
  ls -la "$HOME"
  log "--- $HOME/public_html ---"
  ls -la "$HOME/public_html" || log "there is no $HOME/public_html"

  if [ -n "$OVERRIDE" ]; then
    DEPLOYPATH="$OVERRIDE"
  elif [ -d "$HOME/public_html" ]; then
    DEPLOYPATH="$HOME/public_html"
  else
    # Fallback: the site is wherever the index.html carrying the brand sits,
    # ignoring this checkout's own copy.
    log "no public_html — searching for the live index.html"
    LIVE="$(find "$HOME" -maxdepth 5 -name index.html \
      -not -path "$REPO/*" -not -path "*/repositories/*" -not -path "*/mail/*" \
      -exec grep -l LOGIMOTORS {} + 2>/dev/null | head -n 1)"
    [ -n "$LIVE" ] || { log "FAILED — nothing to deploy into under $HOME."; return 1; }
    DEPLOYPATH="$(dirname "$LIVE")"
  fi

  log "deploying into $DEPLOYPATH"

  set -e
  for item in assets css data js locales; do
    cp -R "$item" "$DEPLOYPATH/"
  done
  cp index.html "$DEPLOYPATH/"

  {
    git log -1 --format='%h %s'
    date -u
    echo "into $DEPLOYPATH"
  } > "$DEPLOYPATH/deploy-stamp.txt"

  log "copied. $DEPLOYPATH now holds:"
  ls -la "$DEPLOYPATH"
  log "finished"
}

LOG="$(mktemp)"
main 2>&1 | tee "$LOG"
STATUS=${PIPESTATUS[0]}

# Last act, and deliberately outside main: even a failed run leaves its
# reasoning somewhere fetchable.
if [ -d "$HOME/public_html" ]; then
  cp "$LOG" "$HOME/public_html/deploy-log.txt"
fi
rm -f "$LOG"
exit "$STATUS"
