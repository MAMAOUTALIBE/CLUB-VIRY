import { lookup as dnsLookup } from "node:dns/promises";
import net from "node:net";

type DnsLookup = (
  hostname: string,
  options: { all: true; verbatim: true }
) => Promise<Array<{ address: string; family: number }>>;

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  return (
    BLOCKED_HOSTNAMES.has(normalized) ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  );
}

function isPrivateIpv4(address: string): boolean {
  const octets = address.split(".").map((part) => Number.parseInt(part, 10));

  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && octets[2] === 0) ||
    (a === 192 && b === 0 && octets[2] === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && octets[2] === 100) ||
    (a === 203 && b === 0 && octets[2] === 113) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string): boolean {
  const normalized = normalizeHostname(address);

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    return net.isIP(mappedIpv4) === 4 ? isPrivateIpv4(mappedIpv4) : true;
  }

  const firstGroup = normalized.split(":")[0];
  const first = Number.parseInt(firstGroup || "0", 16);

  if (!Number.isFinite(first)) {
    return true;
  }

  return (
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xff00) === 0xff00 ||
    normalized.startsWith("2001:db8:")
  );
}

export function isPrivateOrReservedIp(address: string): boolean {
  const normalized = normalizeHostname(address);
  const version = net.isIP(normalized);

  if (version === 4) {
    return isPrivateIpv4(normalized);
  }

  if (version === 6) {
    return isPrivateIpv6(normalized);
  }

  return true;
}

export async function getSafeWebhookUrl(rawUrl: string | null, lookup: DnsLookup = dnsLookup): Promise<URL | null> {
  if (!rawUrl) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || isBlockedHostname(url.hostname)) {
    return null;
  }

  const hostname = normalizeHostname(url.hostname);

  if (net.isIP(hostname)) {
    return isPrivateOrReservedIp(hostname) ? null : url;
  }

  try {
    const records = await lookup(hostname, { all: true, verbatim: true });

    if (records.length === 0 || records.some((record) => isPrivateOrReservedIp(record.address))) {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}
