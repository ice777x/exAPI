import cheerio from "cheerio";
import axios from "axios";

async function getCurrencies() {
  const {data} = await axios.get("https://kur.doviz.com/");
  const $ = cheerio.load(data);
  const currencies: any = [];
  $("table#currencies tbody tr").map((i, el) => {
    if ($(el).find("td").attr("colspan") == "7") return;
    const currency = {
      name: $(el).find("td").eq(0).text().split("-")[1].trim(),
      code: $(el).find("td").eq(0).text().trim().split(" ")[0],
      buying: $(el).find("td").eq(1).text(),
      selling: $(el).find("td").eq(2).text(),
      high: $(el).find("td").eq(3).text(),
      low: $(el).find("td").eq(4).text(),
      change: $(el).find("td").eq(5).text().trim(),
    };
    currencies.push(currency);
  });
  return currencies;
}

export default getCurrencies;
