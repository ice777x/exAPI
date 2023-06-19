import cheerio from "cheerio";
import { writeFile, writeFileSync } from "fs";

async function searchSeries(query: string) {
  const res = await fetch("https://www.dizigom.tv/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      Origin: "https://www.dizigom.tv",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4583.0 Safari/537.36 Edg/94.0.971.0",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `action=data_fetch&keyword=${query}&_wpnonce=16a401f185`,
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const series = $(".searchelement").map((i, el) => {
    const title = $(el).find(".searchelement > a").text().trim();
    const url = $(el).find(".searchelement > a").attr("href")?.trim();
    const img = $(el)
      .find(".search-cat-img > a > img")
      .attr("src")
      ?.split("?resize")[0]
      .trim();
    const year = $(el).find("#search-cat-year").text().trim();
    return {
      title,
      url,
      img,
      year,
      slug: url?.split("/")[url.split("/").length - 2] || "",
      type: url?.includes("dizi-izle") ? "serie" : "episode",
    };
  });
  return series.toArray();
}

async function getSeries(q: string) {
  const res = await fetch(`https://www.dizigom.tv/dizi-izle/${q}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  if ($("body").hasClass("error404")) {
    return { error: "Not Found" };
  }
  const images = JSON.parse(html.split("let images = ")[1].split(";")[0]);
  const title = $(".serieTitle").text().trim();
  const imdb = $(".score").text().trim();
  const description = $(".serieDescription > p")
    .map((i, el) => $(el).text().trim())
    .toArray()
    .join("\n");
  const cast = $(".item")
    .map((i, el) => {
      const img = $(el).find("img").attr("src");
      const name = $(el).find("a").text().trim();
      return { img, name };
    })
    .toArray();
  const seasons = $("#butonlar .btn")
    .map((i, el) => {
      return $(el).text().trim();
    })
    .toArray();
  const episodes = $(".bolumust")
    .map((i, el) => {
      const url = $(el).find("a").attr("href");
      const title = $(el).find(".baslik").first().text().split("(")[0].trim();
      const episode_name = $(el)
        .find(".baslik")
        .children()
        .last()
        .text()
        .trim()
        .replace(/(\(|\))/g, "");
      const date = $(el).find(".tarih").text().trim();
      return {
        url,
        title,
        date,
        episode_name,
        slug: url?.split("/")[url.split("/").length - 2],
      };
    })
    .toArray();
  return { title, imdb, description, cast, seasons, episodes, images };
}

async function getEpisode(q: string) {
  const res = await fetch(`https://www.dizigom.tv/${q}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  if ($("body").hasClass("error404")) {
    return { error: "Not Found" };
  }
  const title = $("h1.title-border").text().trim();
  // const t = $(".player > script").html()?.split("sources:")[1].split("}")[0];
  const reg = /https\:\/\/www\.dizigom\.tv\/wp-json\/wp\/v2\/posts\/\d+/g;
  const url = reg.exec(html)?.[0];
  if (!url) return { error: "Not Found" };
  const video = await getVideo(url);
  return { title, video };
}

async function getVideo(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  const video = data.content.rendered.split("src=")[1].split('"')[1];
  return video;
}
export { searchSeries, getSeries, getEpisode };
