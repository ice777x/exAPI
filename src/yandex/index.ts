import cheerio from "cheerio";
import axios from "axios";

async function fetchYandexPhoto(query: any, number: any = 1): Promise<any> {
  const resp = await axios.get(
    `https://yandex.com.tr/gorsel/search?p=${number}&text=${query}&isize=large&itype=photo&lr=11508&rpt=image`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        referer: "https://www.yandex.com",
      },
    }
  );
  const data = await resp.data;
  const $ = cheerio.load(data);
  const photos = $("div.serp-item")
    .map((i, el) => {
      const data = JSON.parse(el.attribs["data-bem"]);
      return {
        title: data["serp-item"].snippet.title,
        src: data["serp-item"].img_href,
      };
    })
    .toArray();
  return photos;
}

async function getYandexPhoto(query: any): Promise<any> {
  const pro = [];
  for (let x of [1, 2]) {
    const photos = fetchYandexPhoto(query, x);
    pro.push(photos);
  }
  const imgs = await Promise.all(pro);
  return imgs.flat();
}

export {getYandexPhoto};
