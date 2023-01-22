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
        regeneratableList = { title: null, content: [] };
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
          regeneratableList.content.push({ list_content: list });
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
  return { table: tableData(data), content: wiki, images: images };
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
      tr_url: `https://tr.wikipedia.org/wiki/${item.key}`,
      description: item.description,
      thumbnail: item.thumbnail
        ? "https:" + item.thumbnail.url.replace("60px", "600px")
        : null,
      meta_source: `/wikipedia/${item.key}`,
    };
  });
  return items;
}

function tableData(data: any) {
  const $ = cheerio.load(data);
  const table: any = [];
  if ($("div.mw-parser-output table.sidebar").toArray().length > 0) {

    $("div.mw-parser-output table.sidebar tr").map((i, el) => {
      let img = {}
      if ($(el).find("td a.image").toArray().length > 0) {
        Object.assign(img, { url: $(el).find("td a.image img").attr("src") });
        Object.assign(img, { caption: $(el).find("td").text() });
      };
      const value = $(el).find('td').text()
      // const key = $(el).find("th").text().temizle();
      // const value = $(el).find("td").text().temizle();
      // if (key == "") return;
      table.push({
        value,
        img: img ? img : null
      })
    })
  } else if ($("div.mw-parser-output table.infobox").toArray().length > 0) {
    $("div.mw-parser-output table.infobox tr").map((i, el) => {
      let img = {}
      console.log($(el).find("td a.image").toArray().length)
      if ($(el).find("td a.image").toArray().length > 0) {
        Object.assign(img, { url: "https:" + $(el).find("td a.image img").attr("src") });
        Object.assign(img, { caption: $(el).find("td").text().temizle() });
      };
      const key = $(el).find('th').text().temizle()
      const value = $(el).find('td').text().temizle()
      // return $(el).text().temizle()
      table.push({
        key,
        value,
        img: img != Object() ? img : null,
      })
    })
    return table;
  }
  return table;
}

declare global {
  interface String {
    temizle(): string;
  }
}
String.prototype.temizle = function (): string {
  var target = String(this);
  return String(target.replace(/\[\d*\]/gim, "").replace(/\n/gim, " ").trim());
};

export { getWikiSearchResult, getWiki };
