import express, { Application, Request, Response, query, response } from "express";
import { getWord } from "./tdk";
import { readAllWords, writeWordToJson, responseModel } from "../utils/words";
import { getSearchResult } from "./google";
import { getYandexPhoto } from "./yandex";
import { filterByCity, getEarthquake } from "./earthquake";
import cors from "cors";
import getCurrencies from "./currencies";
import { getWiki, getWikiSearchResult } from "./wikipedia";
import { getVideoInfo, searchVideo } from "./youtube";
import { getLyrics } from "./lyrics";
import { enSonHaber, pusholder } from "./news";
import CNN from "./news/cnn";
import TRT from "./news/trt";
import hurriyet from "./news/hurriyet";
import haberturk from "./news/haberturk";

const app: Application = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const router = express.Router();
const routers = [
  {
    path: "/",
    method: "GET",
    detail: "root",
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
    path: "/currencies",
    method: "GET",
    detail: "TRY Currencies API",
    examples: ["/currencies"],
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
  {
    path: "/news",
    method: "GET",
    detail: "Youtube API",
    examples: ['/news/trt', '/news/pusholder'],
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

app.get("/lyrics", async (req: Request, res: Response) => {
  const data = await getLyrics("Yasl Amca", "Sabaha Kadar");
  res.send({ data });
})

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
app.get("/news", async (req: Request, res: Response) => {
  const newsRouter = [
    {
      path: "/news/cnn",
      publisher: "CNN",
    },
    {
      path: "/news/trt",
      publisher: "TRT",
    },
    {
      path: "/news/ensonhaber",
      publisher: "En Son Haber"
    },
    {
      path: "/news/pusholder",
      publisher: "Pusholder"
    },
    {
      path: "/news/haberturk",
      publisher: "Habertürk"
    },
    {
      path: "/news/hurriyet",
      publisher: "Hürriyet"
    },
  ]
  res.status(200).json(newsRouter);
})
app.get("/news/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (id) {
    if (id == "cnn") {
      const data = await CNN();
      const resp = responseModel(200, "CNN", data, { publisher: "CNN" });
      res.status(200).json(resp);
    } else if (id == "trt") {
      const data = await TRT();
      if (data) {
        const resp = responseModel(200, "TRT", data, { publisher: "TRT" });
        res.status(200).json(resp)
      } else {
        const resp = responseModel(400, 'Data not found', null, { publisher: "TRT" })
        res.status(400).json(resp)
      }
    } else if (id == "ensonhaber") {
      const data = await enSonHaber();
      if (data) {
        const resp = responseModel(200, "En Son Haber", data, { publisher: "ensonhaber" })
        res.status(200).json(resp)
      } else {
        const resp = responseModel(400, "Data not found", null, { publisher: "ensonhaber" })
        res.status(400).json(resp)
      }
    } else if (id == "pusholder") {
      const data = await pusholder();
      if (data) {
        const resp = responseModel(200, "Pusholder", data, { publisher: "pusholder" })
        res.status(200).json(resp)
      } else {
        const resp = responseModel(400, "Data not found", null, { publisher: "pusholder" })
        res.status(400).json(resp)
      }
    } else if (id == "hurriyet") {
      const data = await hurriyet();
      if (data) {
        const resp = responseModel(200, "Hürriyet", data, { publisher: "hurriyet" })
        res.status(200).json(resp)
      } else {
        const resp = responseModel(400, "Data not found", null, { publisher: "hurriyet" })
        res.status(400).json(resp)
      }
    } else if (id == "haberturk") {
      const data = await haberturk();
      if (data) {
        const resp = responseModel(200, "Habertürk", data, { publisher: "haberturk" })
        res.status(200).json(resp)
      } else {
        const resp = responseModel(400, "Data not found", null, { publisher: "haberturk" })
        res.status(400).json(resp)
      }
    }

  }
})

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

app.get("/currencies", async (req: Request, res: Response) => {
  const data = await getCurrencies();
  if (data) {
    const resp = responseModel(200, "TRY Currencies Data", data);
    return res.status(200).json(resp);
  } else {
    const resp = responseModel(400, "TRY Currencies Data not found", null);
    return res.status(404).json(resp);
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
    console.log(data)
    if (data) {
      const resp = responseModel(200, `Youtube search results for ${id}`, data);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Invalid Video ID", null);
      return res.status(404).json(resp);
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

export { router };
