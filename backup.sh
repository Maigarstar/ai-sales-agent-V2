#!/bin/bash

BACKUP_TIME=$(date +"%Y-%m-%d-%H-%M-%S")

echo "Creating backup at $BACKUP_TIME..."

mkdir -p backups/vendor-agent-$BACKUP_TIME

cp -r app backups/vendor-agent-$BACKUP_TIME/
cp -r lib backups/vendor-agent-$BACKUP_TIME/
cp -r public backups/vendor-agent-$BACKUP_TIME/

[ -d types ] && cp -r types backups/vendor-agent-$BACKUP_TIME/
[ -f package.json ] && cp package.json backups/vendor-agent-$BACKUP_TIME/
[ -f package-lock.json ] && cp package-lock.json backups/vendor-agent-$BACKUP_TIME/
[ -f next.config.ts ] && cp next.config.ts backups/vendor-agent-$BACKUP_TIME/
[ -f tsconfig.json ] && cp tsconfig.json backups/vendor-agent-$BACKUP_TIME/
[ -f postcss.config.mjs ] && cp postcss.config.mjs backups/vendor-agent-$BACKUP_TIME/
[ -f eslint.config.mjs ] && cp eslint.config.mjs backups/vendor-agent-$BACKUP_TIME/

cd backups
zip -r vendor-agent-backup-$BACKUP_TIME.zip vendor-agent-$BACKUP_TIME
cd ..

echo "Backup completed!"
echo "Backup folder: backups/vendor-agent-$BACKUP_TIME"
echo "ZIP archive: backups/vendor-agent-backup-$BACKUP_TIME.zip"
