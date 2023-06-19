import Parser from "rss-parser";

const URLS = {
  ntv: "https://www.ntv.com.tr/son-dakika.rss",
  aa: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
  anayurt: "https://anayurtgazetesi.com/rss/kategori/son-dakika-haberler",
  cumhuriyet: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml",
  dunya: "https://www.dunya.com/rss",
  haberturk: "https://www.haberturk.com/rss/kategori/gundem.xml",
  milliyet: "https://www.milliyet.com.tr/rss/rssnew/sondakikarss.xml",
  sabah: "https://www.sabah.com.tr/rss/sondakika.xml",
  star: "https://www.star.com.tr/rss/rss.asp?cid=13",
  takvim: "https://www.takvim.com.tr/rss/guncel.xml",
  veryansin: "https://www.veryansintv.com/feed/",
  mansetturkiye: "https://www.mansetturkiye.com/rss_gundem_10.xml",
  vatan: "https://www.gazetevatan.com/rss/gundem.xml",
  yenisafak: "https://www.yenisafak.com/rss?xml=gundem",
  cnn: "https://www.cnnturk.com/feed/rss/all/news",
  trt: "https://www.trthaber.com/sondakika.rss",
  ensonhaber: "https://www.ensonhaber.com/rss/ensonhaber.xml",
  mynet: "https://www.mynet.com/haber/rss/sondakika",
  tha: "https://www.turkiyehaberajansi.com/rss.xml",
  finansgundem: "https://www.finansgundem.com/rss",
  bloomberg: "https://www.bloomberght.com/rss",
  nd: "https://www.nd-aktuell.de/rss/aktuell.php",
};

const parser = new Parser();
async function getNews(url: string) {
  const feed = await parser.parseURL(url);
  return {
    author: {
      name: feed.title,
      link: feed.link,
      image:
        (typeof feed.image === "string" && feed.image) ||
        (typeof feed.image === "object" && feed.image.url) ||
        (feed.enclosure?.url && feed.enclosure.url) ||
        "",
      description: feed.description,
      language: feed.language,
    },
    items: feed.items.map((item) => {
      const reg = /src\s*=\s*(?:"|')(?<img>.+?)(?:"|')/gm;
      const image =
        (typeof item.image === "string" && item.image) ||
        (item.enclosure && item.enclosure.url) ||
        reg.exec(item.content!)?.groups?.img;
      return {
        title: item.title?.replace(/&quot;/g, '"'),
        image: image
          ?.replace("width=208", "width=1080")
          .replace("&q=60", "&q=100"),
        date: new Date(item.pubDate!).toLocaleString("tr-TR"),
        content_encoded: item["content:encodedSnippet"].replaceAll(
          '\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1600910645713416"\r\n     crossorigin="anonymous">\r\n<ins class="adsbygoogle"\r\n     style="display:block; text-align:center;"\r\n     data-ad-layout="in-article"\r\n     data-ad-format="fluid"\r\n     data-ad-client="ca-pub-1600910645713416"\r\n     data-ad-slot="3986516310">\r\n\r\n     (adsbygoogle = window.adsbygoogle || []).push({});',
          ""
        ),
        content: item.contentSnippet
          ?.replace(/&quot;/g, '"')
          .replace("Devamı için tıklayınız", "")
          .replace("İşte...", "")
          .trim(),
        link: item.link ? item.link : feed.link + "/" + item.guid,
        categories: item.categories || [],
        guid: item.guid,
        author: item.creator,
      };
    }),
  };
}
export { getNews };
