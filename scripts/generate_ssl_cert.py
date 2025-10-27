#!/usr/bin/env python
"""
SSL Certificate generation script for development and staging environments
Generates self-signed certificates for HTTPS testing
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import subprocess

# Certificate configuration
CERT_VALIDITY_DAYS = 365
KEY_SIZE = 2048
COUNTRY = "US"
STATE = "Development"
LOCALITY = "Local"
ORGANIZATION = "Inventory Management System"
ORGANIZATIONAL_UNIT = "Development"
COMMON_NAME = "localhost"
EMAIL = "admin@localhost"

# Alternative names for certificate
ALT_NAMES = [
    "DNS:localhost",
    "DNS:127.0.0.1",
    "DNS:*.localhost",
    "IP:127.0.0.1",
    "IP:0.0.0.0"
]


def generate_private_key(cert_dir: Path, key_file: str):
    """Generate private key"""
    key_path = cert_dir / key_file
    print(f"Generating private key: {key_path}")

    cmd = [
        'openssl', 'genrsa',
        '-out', str(key_path),
        str(KEY_SIZE)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Failed to generate private key: {result.stderr}")
        return False

    # Set proper permissions
    key_path.chmod(0o600)
    print("Private key generated successfully")
    return True


def generate_certificate_request(cert_dir: Path, key_file: str, csr_file: str):
    """Generate certificate signing request"""
    key_path = cert_dir / key_file
    csr_path = cert_dir / csr_file

    print(f"Generating certificate request: {csr_path}")

    # Create OpenSSL config for SAN
    config_content = f"""
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = {COUNTRY}
ST = {STATE}
L = {LOCALITY}
O = {ORGANIZATION}
OU = {ORGANIZATIONAL_UNIT}
CN = {COMMON_NAME}
emailAddress = {EMAIL}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = {','.join(ALT_NAMES)}
"""

    config_file = cert_dir / "openssl.cnf"
    config_file.write_text(config_content)

    cmd = [
        'openssl', 'req',
        '-new',
        '-key', str(key_path),
        '-out', str(csr_path),
        '-config', str(config_file)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cert_dir)
    if result.returncode != 0:
        print(f"Failed to generate certificate request: {result.stderr}")
        return False

    print("Certificate request generated successfully")
    return True


def generate_self_signed_certificate(cert_dir: Path, key_file: str, csr_file: str, cert_file: str):
    """Generate self-signed certificate"""
    key_path = cert_dir / key_file
    csr_path = cert_dir / csr_file
    cert_path = cert_dir / cert_file

    print(f"Generating self-signed certificate: {cert_path}")

    cmd = [
        'openssl', 'x509',
        '-req',
        '-in', str(csr_path),
        '-signkey', str(key_path),
        '-out', str(cert_path),
        '-days', str(CERT_VALIDITY_DAYS),
        '-sha256',
        '-extfile', str(cert_dir / "openssl.cnf"),
        '-extensions', 'v3_req'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, cwd=cert_dir)
    if result.returncode != 0:
        print(f"Failed to generate certificate: {result.stderr}")
        return False

    print("Self-signed certificate generated successfully")
    return True


def verify_certificate(cert_dir: Path, cert_file: str):
    """Verify the generated certificate"""
    cert_path = cert_dir / cert_file

    print(f"Verifying certificate: {cert_path}")

    cmd = [
        'openssl', 'x509',
        '-in', str(cert_path),
        '-text',
        '-noout'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Certificate verification failed: {result.stderr}")
        return False

    # Check if certificate contains our subject alternative names
    cert_info = result.stdout
    if "Subject Alternative Name:" in cert_info:
        print("Certificate includes Subject Alternative Names")
    else:
        print("Warning: Certificate does not include Subject Alternative Names")

    # Check expiration date
    for line in cert_info.split('\n'):
        if 'Not After' in line:
            print(f"Certificate expiration: {line.strip()}")
            break

    print("Certificate verification completed")
    return True


def generate_dhparam(cert_dir: Path, dhparam_file: str = "dhparam.pem"):
    """Generate Diffie-Hellman parameters for enhanced security"""
    dhparam_path = cert_dir / dhparam_file

    print(f"Generating DH parameters: {dhparam_path}")
    print("This may take a few minutes...")

    cmd = [
        'openssl', 'dhparam',
        '-out', str(dhparam_path),
        '2048'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Failed to generate DH parameters: {result.stderr}")
        return False

    print("DH parameters generated successfully")
    return True


def main():
    """Main certificate generation function"""
    import argparse

    parser = argparse.ArgumentParser(description='SSL Certificate Generation Utility')
    parser.add_argument('--cert-dir', default='ssl', help='Directory to store certificates')
    parser.add_argument('--key-file', default='key.pem', help='Private key filename')
    parser.add_argument('--cert-file', default='cert.pem', help='Certificate filename')
    parser.add_argument('--csr-file', default='cert.csr', help='Certificate request filename')
    parser.add_argument('--generate-dhparam', action='store_true', help='Generate DH parameters')
    parser.add_argument('--force', action='store_true', help='Overwrite existing files')

    args = parser.parse_args()

    cert_dir = Path(args.cert_dir)
    cert_dir.mkdir(parents=True, exist_ok=True)

    # Check if files already exist
    key_path = cert_dir / args.key_file
    cert_path = cert_dir / args.cert_file

    if key_path.exists() or cert_path.exists():
        if not args.force:
            print(f"Certificate files already exist in {cert_dir}")
            print("Use --force to overwrite existing files")
            return
        else:
            print("Overwriting existing certificate files")

    print("Starting SSL certificate generation...")
    print(f"Certificate directory: {cert_dir.absolute()}")
    print("-" * 50)

    try:
        # Generate private key
        if not generate_private_key(cert_dir, args.key_file):
            sys.exit(1)

        # Generate certificate request
        if not generate_certificate_request(cert_dir, args.key_file, args.csr_file):
            sys.exit(1)

        # Generate self-signed certificate
        if not generate_self_signed_certificate(cert_dir, args.key_file, args.csr_file, args.cert_file):
            sys.exit(1)

        # Verify certificate
        if not verify_certificate(cert_dir, args.cert_file):
            sys.exit(1)

        # Generate DH parameters if requested
        if args.generate_dhparam:
            generate_dhparam(cert_dir)

        print("-" * 50)
        print("SSL certificate generation completed successfully!")
        print()
        print("Generated files:")
        print(f"  Private key: {key_path}")
        print(f"  Certificate: {cert_path}")
        print(f"  Certificate request: {cert_dir / args.csr_file}")
        if args.generate_dhparam:
            print(f"  DH parameters: {cert_dir / 'dhparam.pem'}")
        print()
        print("Next steps:")
        print("1. Copy certificate files to your web server")
        print("2. Configure your web server to use these certificates")
        print("3. Update your application configuration")
        print("4. Test HTTPS connection")
        print()
        print("WARNING: This is a self-signed certificate for development/testing only!")
        print("Do not use in production. Obtain a proper certificate from a CA.")

    except Exception as e:
        print(f"Certificate generation failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()