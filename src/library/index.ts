import cheerio from "cheerio";

export default async function Library(query: string) {
  const libgen = `https://libgen.li/index.php?req=${query}&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&objects%5B%5D=e&objects%5B%5D=s&objects%5B%5D=a&objects%5B%5D=p&objects%5B%5D=w&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=a&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=100&covers=on&filesuns=all&curtab=f`;
  const res = await fetch(libgen);
  const html = await res.text();
  const $ = cheerio.load(html);
  const tr = $("table.table > tbody > tr")
    .map((i, el) => {
      let title_length = $(el)
        .find("td")
        .eq(1)
        .find("a")
        .toArray()
        .map((el) => {
          if ($(el).text().trim().length === 1) {
            return;
          }
          return $(el).text().trim();
        })
        .filter(Boolean).length;
      return {
        title:
          title_length === 1
            ? $(el)
                .find("td")
                .eq(1)
                .find("a")
                .toArray()
                .map((el) => {
                  if ($(el).text().trim().length === 1) {
                    return;
                  }
                  return $(el).text().trim();
                })
                .filter(Boolean)
                .join("\n")
                .trim()
            : $(el)
                .find("td")
                .eq(1)
                .find("a")
                .toArray()
                .map((el) => {
                  if ($(el).text().trim().length === 1) {
                    return;
                  }
                  return $(el).text().trim();
                })
                .filter(Boolean)
                .slice(0, -1)
                .join("\n")
                .trim(),
        img:
          $(el).find("td").eq(0).find("img").attr("src") &&
          "https://libgen.li" +
            //   @ts-ignore
            $(el)
              .find("td")
              .eq(0)
              .find("img")
              .attr("src")
              .replace("_small", ""),
        author: $(el).find("td").eq(2).text(),
        publisher: $(el).find("td").eq(3).text(),
        year: $(el).find("td").eq(4).text(),
        pages: $(el).find("td").eq(6).text(),
        language: $(el).find("td").eq(5).text(),
        size: $(el).find("td").eq(7).text(),
        id: $(el)
          .find("td")
          .eq(7)
          .find("a")
          .attr("href")
          ?.match(/id=(\d+)/)![1],
        ext: $(el).find("td").eq(8).text(),
        download: $(el).find("td").eq(9).find("a").attr("href"),
      };
    })
    .toArray();
  return tr;
}
