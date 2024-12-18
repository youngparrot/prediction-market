export function formatTokenAddress(address) {
  if (address && address.startsWith("0x") && address.length === 42) {
    const start = address.slice(0, 7);
    const end = address.slice(-5);
    return `${start}...${end}`;
  }

  return address; // Return as is if it's not a valid address
}

export function calculateExpirationDate(timestamp, days) {
  // 1. Convert both lock timestamp and additional seconds to milliseconds
  const timestampMs = timestamp * 1000n;
  const additionalMs = days * 24n * 60n * 60n * 1000n;

  // 2. Add them together to get the expiration time in milliseconds
  const expirationTimestampMs = timestampMs + additionalMs;

  // 3. Convert to a regular Date by casting BigInt to Number
  const expirationDate = new Date(Number(expirationTimestampMs));

  return expirationDate.toISOString(); // Format as needed
}
