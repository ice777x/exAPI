import cheerio from "cheerio";
import axios from "axios";

async function getWiki(query: any) {
  const resp = await axios.get(`https://tr.wikipedia.org/wiki/${query}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  const data = resp.data;
  const $ = cheerio.load(data);
  const wiki: any[] = [];
  const images: any = $("div.mw-parser-output div.thumbinner")
    .map((i, el) => {
      return {
        caption: $(el).find("div.thumbcaption").text().temizle(),
        src: $(el).find("img").attr("src"),
      };
    })
    .toArray();

  let regeneratableList: any = {
    title: $("h1#firstHeading").text(),
    content: [],
  };
  $("div.mw-parser-output")
    .find("p, h2, h3, h4, h5, h6, ul")
    .map((i, el) => {
      if (el.tagName == "h2" || el.tagName == "h3") {
        const title = $(el).find("span.mw-headline").text().temizle();
        wiki.push(regeneratableList);
        regeneratableList = {title: null, content: []};
        if (
          title == "Kaynakça" ||
          title == "Dış bağlantılar" ||
          title == "Ayrıca bakınız"
        )
          return;
        regeneratableList.title = title;
      } else if (el.tagName == "p") {
        const text = $(el).text().temizle();
        regeneratableList.content.push(text);
      } else if (el.tagName == "ul") {
        const list: any = [];
        if ($(el).parent(".mw-parser-output")) {
          $(el)
            .find("li")
            .map((i, el) => {
              list.push($(el).text().temizle());
            });
          regeneratableList.content.push({list_content: list});
        }
        return;
      } else {
        return;
      }
    });
  wiki.forEach((el: any) => {
    if (el.title === null) {
      wiki.splice(wiki.indexOf(el), 1);
    }
  });
  return {content: wiki, images: images};
}

async function getWikiSearchResult(query: any) {
  const resp = await axios.get(
    `https://tr.wikipedia.org/w/rest.php/v1/search/title?q=${query}&limit=20`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );
  const data = resp.data;
  const items = data.pages.map((item: any, i: any) => {
    return {
      search_key: item.key,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail
        ? "https:" + item.thumbnail.url.replace("60px", "600px")
        : null,
      meta_source: `/wikipedia/${item.key}`,
    };
  });
  return items;
}

declare global {
  interface String {
    temizle(): string;
  }
}
String.prototype.temizle = function (): string {
  var target = String(this);
  return String(target.replace(/\[\d*\]/gim, "").replace(/\n/gim, ""));
};

export {getWikiSearchResult, getWiki};
