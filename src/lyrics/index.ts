async function getLyrics(artist: string, song: string) {
    const url = `https://genius.com/Eminem-rap-god-lyrics`;
    const response = await fetch(url);
    const data = await response.text();
    const t = data.split("window.__PRELOADED_STATE__ = JSON.parse(")[1].split(");")[0];
    const a = t.replace(/\"/g, '"').replace(/\\/g, "\\").replace(/\'/g, "'")
    console.log(a)
    return a
}
export { getLyrics };