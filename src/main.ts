import cors from "cors";
import express, {
  Application,
  Request,
  Response,
  query,
  response,
} from "express";
import fs from "fs";
import { getWord } from "./tdk";
import { readAllWords, writeWordToJson, responseModel } from "../utils/words";
import { getSearchResult } from "./google";
import { getYandexPhoto } from "./yandex";
import { filterByCity, getEarthquake } from "./earthquake";
import { getWiki, getWikiSearchResult } from "./wikipedia";
import { downloadFile, getVideoInfo, searchVideo } from "./youtube";
import { getLyrics } from "./lyrics";
import path from "path";
import Library from "./library";
import { getNews } from "./news";
import { getEpisode, getSeries, searchSeries } from "./movies/series";

const app: Application = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const routers = [
  {
    path: "/",
    method: "GET",
    detail: "root",
  },
  {
    path: "/news",
    method: "GET",
    detail: "News API",
    examples: ["/news/milliyet"],
  },
  {
    path: "/library",
    method: "GET",
    detail: "Library API",
    examples: ["/library?q=ittihat"],
  },
  {
    path: "/tdk",
    method: "GET",
    detail: "TDK API",
    examples: ["/tdk?q=kelime", "/tdk/oneri?q=kelime"],
  },
  {
    path: "/google",
    method: "GET",
    detail: "Google API",
    examples: ["/google/search?q=kedi"],
  },
  {
    path: "/yandex",
    method: "GET",
    detail: "Yandex API",
    examples: ["/yandex/img?q=kedi"],
  },
  {
    path: "/earthquake",
    method: "GET",
    detail: "Earthquake API",
    examples: ["/earthquake", "/earthquake?city=istanbul"],
  },
  {
    path: "/wikipedia",
    method: "GET",
    detail: "Wikipedia API",
    examples: ["/wikipedia?q=kelime", "/wikipedia/Nikola_Tesla"],
  },
  {
    path: "/youtube",
    method: "GET",
    detail: "Youtube API",
    examples: ["/youtube?q=allegro", "/youtube/C-wu2VcYNCA"],
  },
];

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ response: routers });
});

app.use((req, res, next) => {
  console.log(
    `LOG  Time: ${new Date().toUTCString()}  PATH: ${req.originalUrl}`
  );
  next();
});

const URLS: any = {
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
  seud: "https://rss.sueddeutsche.de/rss/Topthemen",
};

app.get("/news", async (req: Request, res: Response) => {
  res.json({ routes: Object.keys(URLS).map((i) => "/news/" + i) });
});

app.get("/news/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/news/ntv",
    });
    return res.status(400).json(resp);
  }
  if (Object.keys(URLS).indexOf(id) == -1) {
    const resp = responseModel(400, "Invalid news id", null);
    return res.status(404).json(resp);
  }
  const d = await getNews(URLS[id]);
  const resp = responseModel(200, "News", d);
  res.status(200).json(resp);
});

app.get("/movies/series", async (req: Request, res: Response) => {
  const q = req.query.q;
  const series = await searchSeries(q as string);
  res.status(200).json({ series: series });
});

app.get("/movies/series/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/movies/series/ettugrul",
    });
    return res.status(400).json(resp);
  }
  const series = await getSeries(id);
  const resp = responseModel(200, "Series", series);
  res.status(200).json(resp);
});

app.get("/movies/series/episode/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/movies/series/episode/ertugrul/1",
    });
    return res.status(400).json(resp);
  }
  const series = await getEpisode(id as string);
  const resp = responseModel(200, "Episode", series);
  res.status(200).json(resp);
});

app.get("/lyrics", async (req: Request, res: Response) => {
  const data = await getLyrics("Yasl Amca", "Sabaha Kadar");
  res.send({ data });
});

app.get("/library", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({
      status: 200,
      message: "Library API",
      example: "/library?q=ittihat",
    });
  } else {
    const library = await Library(query as string);
    if (library) {
      const resp = responseModel(200, "Library API", library);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Query not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/tdk", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({
      status: 200,
      message: "TDK API",
      example: "/tdk?q=kelime",
    });
  } else {
    const word = await getWord(query);
    if (word) {
      res.status(200).json({
        status: 200,
        response: word,
      });
    } else {
      const resp = responseModel(400, "Word not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/tdk/oneri", async (req: Request, res: Response) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({
      status: 400,
      message: "word is required",
      example: "/tdk?q=kelime",
    });
  } else {
    const words = await readAllWords();
    const possibleWords = words.filter((x: any) => x.startsWith(q));
    if (possibleWords.length > 0) {
      const resp = responseModel(200, "Possible words", possibleWords);
      return res.status(200).json(resp);
    } else if (possibleWords.length == 0) {
      const includesWords = words.filter((x: any) => x.includes(q));
      if (includesWords.length > 0) {
        const resp = responseModel(
          200,
          "Possible words (include)",
          includesWords
        );
        return res.status(200).json(resp);
      } else {
        const resp = responseModel(400, "Word not found", null);
        return res.status(404).json(resp);
      }
    } else {
      const resp = responseModel(400, "Word not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/yandex", async (req: Request, res: Response) => {
  const resp = responseModel(200, "Yandex API", null, {
    example: "/yandex/img?q=kedi",
  });
  res.send(resp);
});

app.get("/yandex/img", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/yandex/img?q=kedi",
    });
    return res.status(400).json(resp);
  } else {
    const photos = await getYandexPhoto(query);
    if (photos) {
      const resp = responseModel(
        200,
        `Yandex image results for ${query}`,
        photos
      );
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Images not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/google", async (req: Request, res: Response) => {
  const resp = responseModel(200, "Google API", null, {
    example: "/google/search?q=kedi",
  });
  res.send(resp);
});

app.get("/google/search", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    const resp = responseModel(400, "query is required", null, {
      example: "/google/search?q=kedi",
    });
    return res.status(400).json(resp);
  } else {
    const searchResult = await getSearchResult(query);
    if (searchResult) {
      const resp = responseModel(
        200,
        `Google search results for ${query}`,
        searchResult
      );
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Search results not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/earthquake", async (req: Request, res: Response) => {
  let query: any = req.query.city;
  if (query) {
    query = query.toLocaleUpperCase("en-US");
    let city = query
      .replace(/Ü/g, "U")
      .replace(/Ç/g, "C")
      .replace(/Ş/g, "S")
      .replace(/Ğ/g, "G");
    const data = await filterByCity(city);
    if (data) {
      const resp = responseModel(200, "Earthquake data", data);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Earthquake data not found", null);
      return res.status(404).json(resp);
    }
  } else {
    const data = await getEarthquake();
    if (data) {
      const resp = responseModel(200, "Earthquake data", data);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Earthquake data not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/wikipedia", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/wikipedia?q=Nikola",
    });
    return res.status(400).json(resp);
  } else {
    const data = await getWikiSearchResult(query);
    if (data) {
      const resp = responseModel(
        200,
        `Wikipedia search results for ${query}`,
        data
      );
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(
        400,
        "Wikipedia search results not found",
        null
      );
      return res.status(404).json(resp);
    }
  }
});

app.get("/wikipedia/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/wikipedia/Nikola_Tesla",
    });
    return res.status(400).json(resp);
  } else {
    const data = await getWiki(id);
    if (data) {
      const resp = responseModel(200, `Wikipedia results for ${id}`, data);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Wikipedia data not found", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/youtube/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/youtube?q=cbum",
    });
    return res.status(400).json(resp);
  } else {
    const data = await getVideoInfo(id);
    if (data) {
      const resp = responseModel(200, `Youtube video details for ${id}`, data);
      return res.status(200).json(resp);
    } else {
      console.log(data);
      const resp = responseModel(400, "Invalid Video ID", null);
      return res.status(404).json(resp);
    }
  }
});

app.get("/youtube/:id/audio/", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/youtube?q=cbum",
    });
    return res.status(400).json(resp);
  } else {
    if (!fs.existsSync(`tmp/${id}.mp3`)) {
      fs.readdir(`tmp`, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          if (file.endsWith(".mp3")) {
            fs.unlink(path.join(`tmp`, file), (err) => {
              if (err) throw err;
            });
          }
        }
      });
      const data = await getVideoInfo(`https://www.youtube.com/watch?v=${id}`);
      if (data) {
        if (data.source.find((item: any) => item.tag === 251)) {
          await downloadFile(
            data.source.find((item: any) => item.tag === 251)!.url,
            id,
            "mp3"
          );
        } else {
          await downloadFile(
            data.source.find((item: any) => item.tag === 250)!.url,
            id,
            "mp3"
          );
        }
      } else {
        const resp = responseModel(400, "Invalid Video ID", null);
        return res.status(404).json(resp);
      }
    }
    const paths = `tmp/${id}.mp3`;
    try {
      const stats = fs.statSync(paths);

      const { size } = stats;

      const { range } = req.headers;

      const start = Number((range || "").replace(/bytes=/, "").split("-")[0]);
      const end = size - 1;
      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(paths, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
      };

      res.writeHead(206, head);

      stream.pipe(res);
    } catch (err) {
      console.log(err);

      return res.send(404).json({
        status: "ERR",
        message: err,
      });
    }
  }
});

app.get("/youtube/:id/video/", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/youtube?q=cbum",
    });
    return res.status(400).json(resp);
  } else {
    if (!fs.existsSync(`tmp/${id}.mp4`)) {
      fs.readdir(`/tmp`, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          if (file.endsWith(".mp3") || file.endsWith(".mp4")) {
            fs.unlink(path.join(`tmp`, file), (err) => {
              if (err) throw err;
            });
          }
        }
      });
      const data = await getVideoInfo(`https://www.youtube.com/watch?v=${id}`);
      if (data) {
        if (data.source.find((item: any) => item.tag === 22)) {
          await downloadFile(
            data.source.find((item: any) => item.tag === 22)!.url,
            id,
            "mp4"
          );
        } else {
          await downloadFile(
            data.source.find((item: any) => item.tag === 18)!.url,
            id,
            "mp4"
          );
        }
      } else {
        const resp = responseModel(400, "Invalid Video ID", null);
        return res.status(404).json(resp);
      }
    }
    const paths = `tmp/${id}.mp4`;
    try {
      const stats = fs.statSync(paths);

      const { size } = stats;

      const { range } = req.headers;

      const start = Number((range || "").replace(/bytes=/, "").split("-")[0]);
      const end = size - 1;
      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(paths, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);

      stream.pipe(res);
    } catch (err) {
      console.log(err);

      return res.send(404).json({
        status: "ERR",
        message: err,
      });
    }
  }
});
app.get("/youtube", async (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    const resp = responseModel(400, "Query is required", null, {
      example: "/youtube?q=cbum",
    });
    return res.status(400).json(resp);
  } else {
    const data = await searchVideo(query);
    if (data) {
      const resp = responseModel(
        200,
        `Youtube search results for ${query}`,
        data
      );
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Youtube search results not found", null);
      return res.status(404).json(resp);
    }
  }
});

setInterval(writeWordToJson, 1000 * 60 * 60 * 24);

app.listen(5000, () => {
  console.log("server is running on port 5000");
});
