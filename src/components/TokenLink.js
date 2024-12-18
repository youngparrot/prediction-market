import { CORE_SCAN_URL } from "@/utils/environment";
import { formatTokenAddress } from "@/utils/format";

export default function TokenLink({ tokenAddress, children }) {
  return (
    <a
      href={`${CORE_SCAN_URL}/token/${tokenAddress}`}
      title={tokenAddress}
      target="_blank"
      className="text-gray-300 hover:text-white"
    >
      {children ? children : formatTokenAddress(tokenAddress)}
    </a>
  );
}
