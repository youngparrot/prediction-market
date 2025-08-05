import { StreamChat } from "stream-chat";

export async function POST(req) {
  const { address } = await req.json();

  if (!address) {
    return new Response(JSON.stringify({ error: "No address provided" }), {
      status: 400,
    });
  }

  const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
  );

  try {
    // Add a timestamp to ensure uniqueness
    // Create a new user ID that includes the original address but ensures uniqueness
    const userId = `${address.toLowerCase()}`;

    // Create token with this new unique ID
    const token = serverClient.createToken(userId);

    // Create user with the unique ID
    await serverClient.upsertUser(
      {
        id: userId,
        name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        image: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        address: userId, // Store original address as a field for reference
      },
      token
    );

    // Return both token and userId so client knows which ID to use
    return new Response(
      JSON.stringify({
        token,
        userId, // Return the new user ID so the client knows which ID to use
      })
    );
  } catch (error) {
    console.error("Error in Stream chat user creation:", error);
    return new Response(
      JSON.stringify({
        error: `Failed to create Stream chat user: ${error.message}`,
        details: error.toString(),
      }),
      { status: 500 }
    );
  }
}
