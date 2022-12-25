const discord = (() => {
  const headers = {
    "User-Agent": "DiscordBot (https://github.com/Arden144/notes, 0.1)",
    "Authorization": `Bot ${process.env.TOKEN}`,
    "Content-Type": "application/json",
  };
  const request = async (method: string, endpoint: string, body: any) => {
    const params: RequestInit = { method, headers, body: JSON.stringify(body) };
    const res = await fetch(`https://discord.com/api/v10/${endpoint}`, params);
    const data = await res.json<any>();
    if (!res.ok) throw new Error(data);
    return data;
  };
  return { post: request.bind(null, "POST") };
})();

const wrap = (context: string) => (err: unknown) => {
  throw new Error(context, { cause: err instanceof Error ? err : undefined });
};

const create = async (content: string): Promise<void> => {
  return discord
    .post(`/channels/${process.env.CHANNEL}/messages`, { content })
    .catch(wrap("create message failed"));
};

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Authorization") !== process.env.AUTH) {
      return new Response("Invalid token", { status: 401 });
    }

    const msg = await req.text();
    return create(msg)
      .then(() => new Response(msg))
      .catch((err) => {
        console.error(err);
        return new Response(
          err instanceof Error ? err.message : "Unknown error",
          { status: 500 }
        );
      });
  },
};
