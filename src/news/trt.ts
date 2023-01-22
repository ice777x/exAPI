import axios from 'axios'
import cheerio from 'cheerio'

export default async function TRT() {
    const url = "http://www.trthaber.com/sondakika.rss"
    const data = await fetch(url)
    const content = await data.text()
    const $ = cheerio.load(content, { xml: true, xmlMode: true })
    let result: any = $('channel')[0].children.map((child: any) => {
        if (child.type == "tag") {
            if (child.name === 'item') {
                const res: any = {}
                child.children.map((ch: any) => {
                    if (ch.type === "tag") {
                        const name = ch.name
                        if (name === 'description') {

                        }
                        if (JSON.stringify(ch.attribs) !== JSON.stringify(new Object())) {
                            Object.assign(res, { image: ch.attribs })
                        } else {
                            if (ch.name === 'description') {
                                ch.children.map((cn: any) => {
                                    if (cn.type === "cdata") {
                                        Object.assign(res, { [name]: cn.children[0].data.trim().replace(/<[^<]+?>/g, "") })
                                    }
                                })
                            } else {
                                if (ch.children[0].type === "cdata") {
                                    const elData = ch.children[0].children[0].data
                                    Object.assign(res, { [name]: elData })
                                } else {
                                    if (name === 'imageUrl') {
                                        const elData = ch.children[0].data
                                        Object.assign(res, { image: elData })
                                    } else {
                                        const elData = ch.children[0].data
                                        Object.assign(res, { [name]: elData })
                                    }
                                }
                            }
                        }
                    }
                })
                return res
            }
        }
    })
    result = result.filter((item: any) => { return item != undefined })
    result = await Promise.all(result.map(async (item: any) => {
        item['content'] = await scraperTRT(item.link)
        return item
    }))
    return result
}

async function scraperTRT(url: string) {
    const res = await fetch(url)
    if (res.status !== 200) {
        return null
    }
    const data = await res.text()
    const $ = cheerio.load(data)
    const ozet = $("h2.detOzet").text()
    let headLineTags = ["strong", "h2", "h3", "h4", "h5", "h6"]
    let text = $("div.editorPart p").map((i, el: any) => {
        if (el.children.length > 0) {
            // if (el.children.find((item: any) => { return item.name === "img" }) !== undefined) {
            if ($(el).find("img").length !== 0) {
                return { img: "https://www.trthaber.com/" + $(el).find("img").attr("src") }
            } else if (el.children.find((item: any) => { return headLineTags.includes(item.name) }) !== undefined) {
                return { subTitle: $(el).text().trim() }
            } else if (el.children.find((item: any) => { return item.name === "i" || item.name === "em" }) !== undefined) {
                return { italic: $(el).text().trim() }
            } else {
                return $(el).text().trim();
            }
        }
    }).toArray()
    text = text.filter((item: any) => {
        return item != "" || item.italic != undefined
    })

    const result = {
        ozet,
        tag: $("div.cat-page-name").text().trim(),
        text
    }
    return result
}


