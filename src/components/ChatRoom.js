"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  Thread,
  ChannelList,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { STREAM_API_KEY } from "@/utils/environment";
import CustomMessageInput from "./CustomMessageInput";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ChatRoom({ id, prediction, className = "" }) {
  const { address: userAddress, isConnected } = useAccount();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  const currentChainId = useChainId();

  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      if (!isConnected || !userAddress || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Disconnect previous user if any
        if (clientRef.current?.userID) {
          await clientRef.current.disconnectUser();
          clientRef.current = null;
        }

        // Create client instance (if not already)
        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientRef.current = client;

        // Get dev token or real token from backend
        const res = await fetch(`/${currentChainId}/api/stream/token`, {
          method: "POST",
          body: JSON.stringify({ address: userAddress.toLowerCase() }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch Stream token");
        }

        const { token, userId } = await res.json();

        // Connect user
        await client.connectUser(
          {
            id: userId,
            name: userAddress.slice(0, 6) + "..." + userAddress.slice(-4),
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${userAddress}`,
          },
          token
        );

        // Join or create token-based channel
        const channelId = `token-${id.toLowerCase()}-chainid-${currentChainId}`;
        const tokenChannel = client.channel("messaging", channelId, {
          name: prediction.question,
          image:
            prediction.image ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${id.toLowerCase()}`,
          members: [userId],
        });

        await tokenChannel.watch();

        // Add user if not already a member
        if (!tokenChannel.state.members[userId]) {
          await tokenChannel.addMembers([userId]);
        }

        if (isMounted) {
          setChannel(tokenChannel);
          setLoading(false);
        }
      } catch (err) {
        console.error("Chat init error:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (clientRef.current?.userID) {
        clientRef.current.disconnectUser().catch(console.error);
        clientRef.current = null;
      }
      setChannel(null);
    };
  }, [userAddress, isConnected, prediction]);

  if (!isConnected) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="py-2">Connect your wallet to join the chat</div>
        <ConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-4 flex justify-center ${className}`}>
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-500 text-center ${className}`}>
        Error loading chat: {error}
      </div>
    );
  }

  if (!channel || !clientRef.current) {
    return (
      <div className={`p-4 text-center ${className}`}>
        Unable to load chat for this token
      </div>
    );
  }

  return (
    <div
      className={`my-4 rounded-xl shadow bg-white max-h-[600px] overflow-hidden flex flex-col ${className}`}
    >
      <Chat client={clientRef.current} theme="str-chat__theme-light">
        <Channel channel={channel}>
          <div className="flex flex-col h-full w-full max-h-[600px]">
            <ChannelHeader />

            {/* Constrain and scroll MessageList only */}
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>

            <MessageInput
              focus
              Input={CustomMessageInput}
              placeholder={`Chat about ${
                prediction.question || "this prediction"
              }...`}
            />
          </div>

          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
