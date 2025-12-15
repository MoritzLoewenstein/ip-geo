# ip-geo

A simple http-server which displays information about the current connection:

![ip and ip version display](./docs/image.png)

## Setup

Enter your MaxMind account id and license key in the secrets files (remove `.example` extension).

## Limitations

The tool blindly trusts whatever IP source is configured via the `IP_SOURCE` environment variable (cloudflare, forwarded_for, real_ip, or socket). Ensure your configuration matches your deployment architecture to prevent users from spoofing IPs.

## Functionality

Utilizes MaxMinds Free GeoLite2-City and GeoLite2-ASN databases to display more information
about the connection.
