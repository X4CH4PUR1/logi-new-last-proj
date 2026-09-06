#!/bin/bash
# Run by cPanel's Git Version Control when you press "Deploy HEAD Commit".
# See .cpanel.yml, which does nothing but call this file.
#
# Why a script rather than a list of tasks: the document root is not
# $HOME/public_html on this account, and a hard-coded path that is wrong
# copies the site into a directory nobody serves — silently, which is how
# five deploys in a row appeared to succeed while the live site stayed on
# a build from August. So the path is discovered, not assumed, and the run
# says out loud what it found.

set -u

# If you know the document root, put it here and discovery is skipped.
# cPanel > Domains lists it next to logimotors.com.
OVERRIDE=""

log() { echo "[deploy] $*"; }

cd "$(dirname "$0")/.." || exit 1
REPO="$(pwd)"

log "user    $(whoami)"
log "home    $HOME"
log "repo    $REPO"
log "commit  $(git log -1 --format='%h %s')"
log "--- contents of $HOME ---"
ls -la "$HOME"

if [ -n "$OVERRIDE" ]; then
  DEPLOYPATH="$OVERRIDE"
  log "using the override path $DEPLOYPATH"
else
  # The live site is wherever the index.html carrying the brand sits. Skip
  # this checkout's own copy, or the deploy would find itself.
  log "--- searching for the live index.html ---"
  find "$HOME" -maxdepth 5 -name index.html \
    -not -path "$REPO/*" -not -path "*/repositories/*" -not -path "*/mail/*" \
    -exec grep -l LOGIMOTORS {} + 2>/dev/null | while read -r hit; do log "candidate  $hit"; done

  LIVE="$(find "$HOME" -maxdepth 5 -name index.html \
    -not -path "$REPO/*" -not -path "*/repositories/*" -not -path "*/mail/*" \
    -exec grep -l LOGIMOTORS {} + 2>/dev/null | head -n 1)"

  if [ -z "$LIVE" ]; then
    log "FAILED — no LOGIMOTORS index.html anywhere under $HOME."
    log "The document root is outside this account. Read it off cPanel > Domains"
    log "and set OVERRIDE at the top of this script."
    exit 1
  fi

  DEPLOYPATH="$(dirname "$LIVE")"
fi

log "deploying into $DEPLOYPATH"
[ -d "$DEPLOYPATH" ] || { log "FAILED — $DEPLOYPATH is not a directory."; exit 1; }

set -e
for item in assets css data js locales; do
  cp -R "$item" "$DEPLOYPATH/"
done
cp index.html "$DEPLOYPATH/"

# Written last, so it exists only if everything above succeeded. Fetching
# https://www.logimotors.com/deploy-stamp.txt then shows what is really live.
{
  git log -1 --format='%h %s'
  date -u
  echo "into $DEPLOYPATH"
} > "$DEPLOYPATH/deploy-stamp.txt"

log "done — $(tr '\n' ' ' < "$DEPLOYPATH/deploy-stamp.txt")"
