# ip-geo

A simple http-server which displays information about the current connection:

![ip and ip version display](./docs/image.png)

## Setup

Enter your MaxMind account id and license key in the secrets files (remove `.example` extension).

## Limitations

It is assumed that this will be used behind a reverse proxy which provides the `x-forwarded-for` header,
which it blindly trusts. If it is not used behind a reverse proxy, a user could request the data
for another ip (not their own) by requesting with the `x-forwarded-for` header. If the header is not
set, the ip of the connecting socket will be used.

## Functionality

Utilizes MaxMinds Free GeoLite2-City and GeoLite2-ASN databases to display more information
about the connection.
