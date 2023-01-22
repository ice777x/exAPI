import cheerio from 'cheerio'
export default async function hurriyet() {

    const res = await fetch("https://www.hurriyet.com.tr/son-dakika-haberleri/tumu/")
    const text = await res.text()
    const $ = cheerio.load(text)
    const result = $("section.son-dakika-contain article").map((i, el) => {
        const image = $(el).find("img").attr("data-src")
        const title = $(el).find("h3").text()
        const description = $(el).find("p").text()
        const time = $(el).find("time").text()
        const link = "https://www.hurriyet.com.tr"+$(el).find("a").attr("href")
        const [hour, minute] = time.split(":")
        const date = new Date()
        date.setHours(parseInt(hour))
        date.setMinutes(parseInt(minute))
        date.setSeconds(0)
        const pubDate = date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
        return {
            title,
            link,
            image,
            description,
            pubDate,
        }
    }).toArray()
    
    return result
}
hurriyet()