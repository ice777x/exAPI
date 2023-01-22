import cheerio from 'cheerio'
export default async function CNN() {
    const url = "https://www.cnnturk.com/feed/rss/all/news"
    const res = await fetch(url)
    const text = await res.text()
    const $ = cheerio.load(text, { xml: true, xmlMode: true })
    const result = $("item").map((i, el) => {
        const res = {};
        el.children.forEach((ch: any) => {
            if (ch.type === "tag") {
                const name = ch.name;
                if (
                    typeof ch.attribs.url == "string" ||
                    JSON.stringify(ch.attribs) !== "{}"
                ) {
                    Object.assign(res, { image: ch.attribs.url });
                } else {
                    if (ch.children[0].type === "cdata") {
                        const elData: string = ch.children[0].children[0].data
                            .trim()
                            .replace(/<[^<]+?>/g, "").replace("&#39;", "'")
                        Object.assign(res, { [name]: elData });
                    } else if (ch.children[0].type === "text") {
                        const elData = ch.children[0].data
                            .trim()
                            .replace(/<[^<]+?>/g, "").replace("&#39;", "'");
                        Object.assign(res, { [name]: elData });
                    } else {
                        const elData = ch.children[0].data
                            .trim()
                            .replace(/<[^<]+?>/g, "").replace("&#39;", "'");
                        Object.assign(res, { [name]: elData });
                    }
                }
            }
            return;
        });
        return res;
    }).toArray()
    return result
}