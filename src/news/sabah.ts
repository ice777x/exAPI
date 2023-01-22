import cheerio from "cheerio";
export default async function sabah() {
  const res = await fetch("https://www.sabah.com.tr/rss/sondakika.xml", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  const text = await res.text();
  const $ = cheerio.load(text, {xml: true, xmlMode: true});
  // const childrens:any = []
  const result = $("item")
    .map((i, el) => {
      const res = {};
      el.children.forEach((ch: any) => {
        if (ch.type === "tag") {
          const name = ch.name;
          if (ch.children[0].type === "cdata") {
            const elData = ch.children[0].children[0].data
              .trim()
              .replace(/<[^<]+?>/g, "");
            Object.assign(res, {[name]: elData});
          } else if (ch.children[0].type === "text") {
            const elData = ch.children[0].data.trim().replace(/<[^<]+?>/g, "");
            Object.assign(res, {[name]: elData});
          } else {
            const elData = ch.children[0].data.trim().replace(/<[^<]+?>/g, "");
            Object.assign(res, {[name]: elData});
          }
        }
        return;
      });
      return res;
    })
    .toArray();
  return result;
}
sabah();
