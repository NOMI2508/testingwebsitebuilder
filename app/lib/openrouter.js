// OpenRouter (Laguna M.1) ko call karne ka helper.
//
// Zaroori: Node 20 ka built-in fetch (undici) is machine par pehle IPv6 try karta
// hai jo timeout ho jata hai ("fetch failed" / ERR_SOCKET_CONNECTION_TIMEOUT).
// Isliye hum yahan Node ka core `https` module `family: 4` (IPv4 force) ke saath
// use karte hain — ye deterministic tarike se kaam karta hai, koi extra package nahi.

import https from "https";

export function chatCompletion(apiKey, body) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        family: 4, // <-- IPv4 force (IPv6 timeout fix)
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Website Builder",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("Request timed out")));
    req.write(payload);
    req.end();
  });
}

// Chat completion call kar ke seedha assistant ka text content return karta hai.
export async function getCompletionText(apiKey, body) {
  const { status, body: raw } = await chatCompletion(apiKey, body);
  if (status < 200 || status >= 300) {
    throw new Error(`OpenRouter error (${status}): ${raw.slice(0, 300)}`);
  }
  const data = JSON.parse(raw);
  return data?.choices?.[0]?.message?.content || "";
}

// STREAMING: model se tokens aate hi aate rehte hain. Isse (1) timeout nahi hota
// kyunki connection par lagatar data aata rehta hai, aur (2) UI par "build hote"
// hue dikha sakte hain. Ye Node core `https` (family: 4) use karta hai.
export function openStream(apiKey, body, options = {}) {
  const { signal } = options;
  const payload = JSON.stringify({ ...body, stream: true });
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(new Error("Request aborted before start."));
      return;
    }
    const req = https.request(
      {
        method: "POST",
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        family: 4,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Website Builder",
        },
      },
      (res) => resolve(res) // res = streaming response (SSE)
    );
    req.on("error", reject);
    // When the client disconnects, tear down the upstream request so we stop
    // consuming the free-tier quota. The consumer then sees an aborted stream.
    if (signal) {
      const onAbort = () => req.destroy(new Error("Client disconnected."));
      signal.addEventListener("abort", onAbort, { once: true });
      req.on("close", () => signal.removeEventListener("abort", onAbort));
    }
    // Idle timeout: OpenRouter beech mein ": OPENROUTER PROCESSING" keep-alive
    // bhejta hai, is liye ye sirf tab fire hoga jab bilkul kuch na aaye.
    req.setTimeout(180000, () => req.destroy(new Error("Request timed out")));
    req.write(payload);
    req.end();
  });
}
