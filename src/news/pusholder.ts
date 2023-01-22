import cheerio from "cheerio"
async function pusholder() {
    const data = await fetch("https://www.pusholder.com.tr/rss", {
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
                        if (typeof ch.attribs.url == "string" || JSON.stringify(ch.attribs) !== "{}") {
                            Object.assign(res, { image: ch.attribs.url })
                        } else {
                            const name = ch.name
                            if (ch.children[0].type === "cdata") {
                                const elData = ch.children[0].children[0].data.trim().replace(/<[^<]+?>/g, "")
                                if (name === "content:encoded") {
                                    Object.assign(res, { content: elData })
                                } else {
                                    Object.assign(res, { [name]: elData })
                                }
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

export default pusholder