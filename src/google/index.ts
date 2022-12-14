import cheerio from "cheerio";

async function getSearchResult(query: any): Promise<any> {
  const resp = await fetch(
    `https://www.google.com/search?q=${query}&source=hp&oq=${query}&sclient=gws-wiz`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        referer: "https://www.google.com",
      },
    }
  );
  const data = await resp.text();
  const $ = cheerio.load(data);
  const results = $("div.yuRUbf > a")
    .map((i, el) => {
      return {
        title: $(el).find("h3").text(),
        link: $(el).attr("href"),
      };
    })
    .toArray();
  return results;
}
export {getSearchResult};
