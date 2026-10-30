<?php
// SHA-256 of the publish password the control room asks for. Only the hash
// lives here, so this file is safe to commit; the password itself is long and
// random, which is what makes a bare SHA-256 enough.
//
// To change it, pick a new long random password and replace the hash with the
// output of:  php -r "echo hash('sha256', 'NEW-PASSWORD');"
const PUBLISH_KEY_SHA256 = 'de3aeb882be6d7fa26a574a3d26aa7b6f5eef802173b3f7c082d6499624fe548';
