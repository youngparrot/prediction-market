import { NATIVE_TOKEN_ADDRESS } from "@/utils/environment";
import { formatTokenAddress } from "@/utils/format";

export default function TokenLink({ scanUrl, tokenAddress, children }) {
  if (tokenAddress === NATIVE_TOKEN_ADDRESS) {
    return children ? children : formatTokenAddress(tokenAddress);
  }

  return (
    <a
      href={`${scanUrl}/token/${tokenAddress}`}
      title={tokenAddress}
      target="_blank"
      className="text-gray-300 hover:text-white"
    >
      {children ? children : formatTokenAddress(tokenAddress)}
    </a>
  );
}
