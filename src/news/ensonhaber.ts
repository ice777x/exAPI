import cheerio from 'cheerio'

export default async function enSonHaber() {
    const data = await fetch("https://www.ensonhaber.com/rss/ensonhaber.xml", {
        headers: {
            "Content-Type": "text/xml",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
    })
    const content = await data.text()
    const $ = cheerio.load(content, { xml: true, xmlMode: true })
    let result = $('channel')[0].children.map((child: any) => {
        if (child.type == "tag") {
            if (child.name === 'item') {
                const res = {}
                child.children.map((ch: any) => {
                    if (ch.type === "tag") {
                        const name = ch.name
                        if (JSON.stringify(ch.attribs) !== JSON.stringify(new Object())) {
                            Object.assign(res, { image: ch.attribs })
                        } else {
                            if (ch.children[0].type === "cdata") {
                                const elData = ch.children[0].children[0].data.trim().replace(/<[^<]+?>/g, "")
                                Object.assign(res, { [name]: elData })
                            } else {
                                const elData = ch.children[0].data
                                Object.assign(res, { [name]: elData })
                            }
                        }
                    }
                })
                return res
            }
        }
    })
    result = result.filter(item => { return item != undefined })
    return result
}