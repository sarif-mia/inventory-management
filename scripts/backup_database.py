#!/usr/bin/env python
"""
Database backup script for Inventory Management System
Creates automated backups with rotation and compression
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime, timedelta
import gzip
import shutil
import subprocess

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_management.settings')
django.setup()

from django.db import connection
from django.conf import settings


class DatabaseBackup:
    def __init__(self):
        self.db_settings = connection.settings_dict
        self.backup_dir = Path(settings.BASE_DIR) / 'backups'
        self.backup_dir.mkdir(exist_ok=True)

        # Backup retention settings
        self.keep_daily = 7
        self.keep_weekly = 4
        self.keep_monthly = 12

    def create_backup(self, backup_type='manual'):
        """Create a database backup"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"{backup_type}_{timestamp}"

        print(f"Creating {backup_type} backup: {backup_name}")

        if self.db_settings['ENGINE'] == 'django.db.backends.postgresql':
            return self._backup_postgresql(backup_name)
        elif self.db_settings['ENGINE'] == 'django.db.backends.mysql':
            return self._backup_mysql(backup_name)
        elif self.db_settings['ENGINE'] == 'django.db.backends.sqlite3':
            return self._backup_sqlite(backup_name)
        else:
            raise ValueError(f"Unsupported database engine: {self.db_settings['ENGINE']}")

    def _backup_postgresql(self, backup_name):
        """Backup PostgreSQL database"""
        backup_file = self.backup_dir / f"{backup_name}.sql.gz"

        cmd = [
            'pg_dump',
            '-h', self.db_settings.get('HOST', 'localhost'),
            '-p', str(self.db_settings.get('PORT', 5432)),
            '-U', self.db_settings.get('USER', ''),
            '-d', self.db_settings['NAME'],
            '--no-password',
            '--format=custom',  # Use custom format for better compression
            '--compress=9',
            '--verbose'
        ]

        env = os.environ.copy()
        env['PGPASSWORD'] = self.db_settings.get('PASSWORD', '')

        try:
            with open(backup_file, 'wb') as f:
                result = subprocess.run(
                    cmd,
                    env=env,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    check=True
                )

            print(f"PostgreSQL backup created: {backup_file}")
            return backup_file

        except subprocess.CalledProcessError as e:
            print(f"PostgreSQL backup failed: {e.stderr.decode()}")
            raise

    def _backup_mysql(self, backup_name):
        """Backup MySQL database"""
        backup_file = self.backup_dir / f"{backup_name}.sql.gz"

        cmd = [
            'mysqldump',
            '-h', self.db_settings.get('HOST', 'localhost'),
            '-P', str(self.db_settings.get('PORT', 3306)),
            '-u', self.db_settings.get('USER', ''),
            f"-p{self.db_settings.get('PASSWORD', '')}",
            self.db_settings['NAME'],
            '--single-transaction',
            '--routines',
            '--triggers'
        ]

        try:
            with gzip.open(backup_file, 'wt', encoding='utf-8') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    check=True
                )

            print(f"MySQL backup created: {backup_file}")
            return backup_file

        except subprocess.CalledProcessError as e:
            print(f"MySQL backup failed: {e.stderr.decode()}")
            raise

    def _backup_sqlite(self, backup_name):
        """Backup SQLite database"""
        db_path = Path(self.db_settings['NAME'])
        backup_file = self.backup_dir / f"{backup_name}.db.gz"

        try:
            with gzip.open(backup_file, 'wb') as f_out:
                with open(db_path, 'rb') as f_in:
                    shutil.copyfileobj(f_in, f_out)

            print(f"SQLite backup created: {backup_file}")
            return backup_file

        except Exception as e:
            print(f"SQLite backup failed: {e}")
            raise

    def rotate_backups(self):
        """Rotate old backups based on retention policy"""
        print("Rotating old backups...")

        # Get all backup files
        backup_files = list(self.backup_dir.glob('*.gz'))
        backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)

        # Group by type and date
        daily_backups = []
        weekly_backups = []
        monthly_backups = []
        manual_backups = []

        for backup_file in backup_files:
            name = backup_file.stem
            if name.startswith('daily_'):
                daily_backups.append(backup_file)
            elif name.startswith('weekly_'):
                weekly_backups.append(backup_file)
            elif name.startswith('monthly_'):
                monthly_backups.append(backup_file)
            else:
                manual_backups.append(backup_file)

        # Keep only the specified number of each type
        self._remove_old_backups(daily_backups, self.keep_daily)
        self._remove_old_backups(weekly_backups, self.keep_weekly)
        self._remove_old_backups(monthly_backups, self.keep_monthly)

        # Keep all manual backups (don't auto-delete)
        print(f"Keeping {len(manual_backups)} manual backups")

    def _remove_old_backups(self, backups, keep_count):
        """Remove old backups, keeping only the most recent ones"""
        if len(backups) > keep_count:
            to_remove = backups[keep_count:]
            for backup_file in to_remove:
                print(f"Removing old backup: {backup_file}")
                backup_file.unlink()

    def get_backup_info(self):
        """Get information about existing backups"""
        backup_files = list(self.backup_dir.glob('*.gz'))

        if not backup_files:
            return "No backups found."

        info = f"Found {len(backup_files)} backup files:\n"
        total_size = 0

        for backup_file in sorted(backup_files, key=lambda x: x.stat().st_mtime, reverse=True):
            size_mb = backup_file.stat().st_size / (1024 * 1024)
            mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)
            info += f"  {backup_file.name} ({size_mb:.2f} MB) - {mtime.strftime('%Y-%m-%d %H:%M:%S')}\n"
            total_size += backup_file.stat().st_size

        total_size_mb = total_size / (1024 * 1024)
        info += f"\nTotal backup size: {total_size_mb:.2f} MB"

        return info

    def cleanup_empty_backups(self):
        """Remove backup files that are too small (likely failed backups)"""
        print("Cleaning up potentially failed backups...")

        for backup_file in self.backup_dir.glob('*.gz'):
            size_kb = backup_file.stat().st_size / 1024
            if size_kb < 100:  # Less than 100KB is likely a failed backup
                print(f"Removing suspiciously small backup: {backup_file} ({size_kb:.1f} KB)")
                backup_file.unlink()


def main():
    """Main backup function"""
    import argparse

    parser = argparse.ArgumentParser(description='Database backup utility')
    parser.add_argument('action', choices=['create', 'rotate', 'info', 'cleanup'],
                       help='Action to perform')
    parser.add_argument('--type', choices=['daily', 'weekly', 'monthly', 'manual'],
                       default='manual', help='Backup type (default: manual)')

    args = parser.parse_args()

    backup = DatabaseBackup()

    try:
        if args.action == 'create':
            backup_file = backup.create_backup(args.type)
            print(f"Backup completed: {backup_file}")

        elif args.action == 'rotate':
            backup.rotate_backups()
            print("Backup rotation completed.")

        elif args.action == 'info':
            info = backup.get_backup_info()
            print(info)

        elif args.action == 'cleanup':
            backup.cleanup_empty_backups()
            print("Cleanup completed.")

    except Exception as e:
        print(f"Backup operation failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()