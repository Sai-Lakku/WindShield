import { runCronCheckTriggers } from "../../../../api/cron/logic";

export async function GET(request: Request) {
  return runCronCheckTriggers(request);
}
