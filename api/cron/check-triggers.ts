import { runCronCheckTriggers } from "./logic";

type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => { send: (body: string) => void };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authRaw = req.headers.authorization;
  const auth = Array.isArray(authRaw) ? authRaw[0] : authRaw;
  const request = new Request(`https://cron.local${req.url ?? ""}`, {
    method: req.method ?? "GET",
    headers: { authorization: auth ?? "" },
  });
  const response = await runCronCheckTriggers(request);
  const body = await response.text();
  res.status(response.status).send(body);
}
