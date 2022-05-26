const initStart = Date.now()
import {
  serve,
} from "https://deno.land/x/sift@0.5.0/mod.ts";
import { bot } from './bot.ts'
import { webhookCallback } from "./deps.deno.ts";

const handleUpdate = webhookCallback(bot, "std/http");

console.log(`Init time: ${Date.now() - initStart}ms, ${Deno.env.get('DENO_REGION')}`)
serve({
  ['/' + Deno.env.get('TOKEN')]: async (req) => {
    if (req.method == "POST") {
      try {
        await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
    return new Response();
  },
  '/': () => {
    return new Response('Hello world!')
  }
});