import { DEFAULT_CHAIN_ID, environments } from "@/utils/environment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";

export default function QuantitySlider({
  min = 1,
  max = 10,
  onChange,
  prediction,
}) {
  const [value, setValue] = useState(min);
  const { data: walletClient } = useWalletClient();

  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  useEffect(() => {
    const fetchChainId = async () => {
      if (walletClient) {
        const id = await walletClient.getChainId(); // Fetch the connected chain ID
        setChainId(id);
      }
    };

    fetchChainId();
  }, [walletClient]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  const calculatePercentage = () => ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full mx-auto py-1 mb-2">
      {/* <label htmlFor="slider" className="block text-body font-medium">
        Select Quantity
      </label> */}
      <input
        id="slider"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full h-1 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #4eb9ff ${calculatePercentage()}%, #e0e0e0 ${calculatePercentage()}%)`,
        }}
      />
      <div className="flex justify-between mt-1 text-body text-sm">
        <span>
          {value} {prediction.paymentToken}{" "}
          <Image
            src={
              environments[chainId]["PREDICTION_MARKET_ADDRESS"][
                prediction.paymentToken
              ].image
            }
            width={20}
            height={20}
            className="w-[24px] h-[24px]"
            alt="Symbol"
          />
        </span>
      </div>
    </div>
  );
}
