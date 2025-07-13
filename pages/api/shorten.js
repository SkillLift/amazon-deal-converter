import { NextResponse } from "next/server";
import { parse } from "url";
import fetch from "node-fetch";

const EXCLUDE_PHRASES = [
  "Top dDeals",
  "Next Deals UK",
  "Huge Bargains",
  "Huge Bargains UK",
  "Thrifty Deals",
  "Price Glitches"
];

const USER_TAGS = {
  user1: "mns-d-21",
  user2: "bb-uk-01-21",
  user3: "ws-t3-21"
};

function cleanAmazonUrl(url) {
  if (url.includes("amazon.co.uk") && url.includes("/ref=")) {
    return url.split("/ref=")[0];
  }
  return url;
}

function addAffiliateTag(url, tag) {
  const u = new URL(url);
  u.searchParams.set("tag", tag);
  return u.toString();
}

async function getRedirectedUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return response.url;
  } catch {
    return url;
  }
}

async function createShortlink(url) {
  const res = await fetch("https://creators.posttap.com/api/create-shortlink", {
    method: "POST",
    headers: {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json",
      "cookie": "_ga=GA1.1.202930833.1751362584; curatedby-prime-day=true; btn_hide_help=true; btn_logged_in=1; btn_logged_in.sig=Nssey5VTPZtPL4tY0GmKCSWryyI; btn_session=df4ea46f-e7c9-4eff-a8f3-d84134dc00cd; btn_session.sig=gV2yhBT3eeiDXXTh3q4g3mj3NgY",
      "origin": "https://creators.posttap.com",
      "referer": "https://creators.posttap.com/?",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
    },
    body: JSON.stringify({
      name: `AmazonLink ${new Date().toISOString()}`,
      url: url,
      tags: []
    })
  });

  if (res.status === 201) {
    const data = await res.json();
    return data?.object?.shortlink || url;
  } else {
    return url;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, user } = req.body;
  const lines = text.split("\n");
  const tag = USER_TAGS[user] || "mns-d-21";

  const updatedLines = [];

  for (const line of lines) {
    if (EXCLUDE_PHRASES.some(p => line.includes(p))) continue;

    const urls = Array.from(line.matchAll(/https?:\/\/[^\s]+/g)).map(match => match[0]);

    let newLine = line;

    for (const url of urls) {
      let redirectedUrl = await getRedirectedUrl(url);
      let cleanedUrl = cleanAmazonUrl(redirectedUrl);

      const u = new URL(cleanedUrl);
      u.pathname = u.pathname.split("/").filter(seg => seg !== "prhoduct").join("/");
      u.search = "";

      let finalUrl = addAffiliateTag(u.toString(), tag);
      let shortUrl = await createShortlink(finalUrl);

      newLine = newLine.replace(url, shortUrl);
    }

    updatedLines.push(newLine);
  }

  let result = updatedLines.join("\n").replace(/#ad/g, "\n#ad");
  res.status(200).json({ cleanedText: result });
}
v
