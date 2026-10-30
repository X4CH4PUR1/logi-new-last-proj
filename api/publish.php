<?php
// Called by the control room's "Publish now" button. Writes the posted content
// straight to data/content.json, so going live no longer needs a download, a
// commit and a deploy.
//
// Request:  POST, JSON body { "key": "<publish password>", "content": { ... } }
// Response: JSON { "ok": true, "content": { ... } } — the content as stored,
//           with every embedded photo swapped for a file under uploads/.

declare(strict_types=1);

require __DIR__ . '/publish-key.php';

const SITE_ROOT = __DIR__ . '/..';
const CONTENT_FILE = SITE_ROOT . '/data/content.json';
const BACKUP_DIR = SITE_ROOT . '/data/backups';
const UPLOAD_DIR = SITE_ROOT . '/uploads';
const KEEP_BACKUPS = 30;

// processImage() in the browser always produces JPEG, but accept the other
// formats an imported backup file might carry.
const IMAGE_TYPES = [
  'image/jpeg' => 'jpg',
  'image/png'  => 'png',
  'image/webp' => 'webp',
  'image/gif'  => 'gif',
];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(int $status, array $body): void
{
  http_response_code($status);
  echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  reply(405, ['ok' => false, 'error' => 'Use POST.']);
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') {
  // PHP silently drops a body larger than post_max_size, so an empty body
  // almost always means "too big", not "nothing sent".
  reply(413, ['ok' => false, 'error' => 'The server received nothing — the content is probably larger than its upload limit (' . ini_get('post_max_size') . ').']);
}

$body = json_decode($raw, true);
if (!is_array($body) || !isset($body['key'], $body['content']) || !is_array($body['content'])) {
  reply(400, ['ok' => false, 'error' => 'The request was not understood.']);
}

if (!is_string($body['key']) || !hash_equals(PUBLISH_KEY_SHA256, hash('sha256', $body['key']))) {
  sleep(1); // slows down guessing
  reply(403, ['ok' => false, 'error' => 'Wrong publish password.']);
}

$content = $body['content'];
if (!isset($content['version'])) {
  reply(400, ['ok' => false, 'error' => 'That does not look like site content.']);
}

try {
  $content = extractImages($content);
  $json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if ($json === false) throw new RuntimeException('The content could not be encoded: ' . json_last_error_msg());
  backupCurrent();
  writeAtomically(CONTENT_FILE, $json . "\n");
} catch (Throwable $err) {
  reply(500, ['ok' => false, 'error' => $err->getMessage()]);
}

reply(200, ['ok' => true, 'content' => $content]);


// Photos arrive inline as data: URLs. Left there they would make content.json
// several megabytes; as files they are cached by browsers and loaded only when
// shown. Names are a hash of the bytes, so re-publishing the same photo reuses
// the file that is already there.
function extractImages($value)
{
  if (is_array($value)) {
    foreach ($value as $k => $v) $value[$k] = extractImages($v);
    return $value;
  }
  if (!is_string($value) || strncmp($value, 'data:image/', 11) !== 0) return $value;

  // strpos rather than a regex: these strings run to hundreds of kilobytes.
  $comma = strpos($value, ';base64,');
  if ($comma === false) return $value;
  $ext = IMAGE_TYPES[strtolower(substr($value, 5, $comma - 5))] ?? null;
  if ($ext === null) return $value;

  $bytes = base64_decode(substr($value, $comma + 8), true);
  if ($bytes === false || @getimagesizefromstring($bytes) === false) return $value;

  if (!is_dir(UPLOAD_DIR) && !mkdir(UPLOAD_DIR, 0755, true)) {
    throw new RuntimeException('Could not create the uploads folder on the server.');
  }
  $name = substr(sha1($bytes), 0, 20) . '.' . $ext;
  $path = UPLOAD_DIR . '/' . $name;
  if (!is_file($path)) writeAtomically($path, $bytes);

  return 'uploads/' . $name;
}

function backupCurrent(): void
{
  if (!is_file(CONTENT_FILE)) return;
  if (!is_dir(BACKUP_DIR) && !mkdir(BACKUP_DIR, 0755, true)) return;

  copy(CONTENT_FILE, BACKUP_DIR . '/content-' . gmdate('Ymd-His') . '.json');

  $old = glob(BACKUP_DIR . '/content-*.json') ?: [];
  sort($old);
  foreach (array_slice($old, 0, max(0, count($old) - KEEP_BACKUPS)) as $file) @unlink($file);
}

// Write beside the target and rename over it, so a visitor never loads a
// half-written file.
function writeAtomically(string $path, string $data): void
{
  $tmp = $path . '.tmp-' . bin2hex(random_bytes(4));
  if (file_put_contents($tmp, $data) !== strlen($data)) {
    @unlink($tmp);
    throw new RuntimeException('Could not write ' . basename($path) . ' on the server. Check that the folder is writable.');
  }
  @chmod($tmp, 0644);
  if (!rename($tmp, $path)) {
    @unlink($tmp);
    throw new RuntimeException('Could not replace ' . basename($path) . ' on the server.');
  }
}
