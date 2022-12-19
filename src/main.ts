import express, {Application, Request, Response} from "express";
import {getWord} from "./tdk";
import {readAllWords, writeWordToJson, responseModel} from "../utils/words";
import {getSearchResult} from "./google";
import {getYandexPhoto} from "./yandex";
import {filterByCity, getEarthquake} from "./deprem";
import cors from "cors";
const app: Application = express();
app.use(express.urlencoded({extended: true}));
app.use(cors());
const router = express.Router();
const routers = [
  {
    path: "/",
    method: "get",
    detail: "root",
  },
  {
    path: "/tdk",
    method: "get",
    detail: "TDK API",
    example: "/tdk?q=kelime",
  },
  {
    path: "/google",
    method: "get",
    detail: "Google API",
    example: "/google/search?q=kedi",
  },
  {
    path: "/yandex",
    method: "get",
    detail: "Yandex API",
    example: "/yandex/img?q=kedi",
  },
  {
    path: "/deprem",
    method: "get",
    detail: "Deprem API",
  },
];

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({response: routers});
});

app.use((req, res, next) => {
  console.log(
    `LOG  Time: ${new Date().toUTCString()}  PATH: ${req.originalUrl}`
  );
  next();
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
  console.log(q);
  if (!q) {
    return res.status(400).json({
      status: 400,
      message: "word is required",
      example: "/tdk?q=kelime",
    });
  } else {
    const words = await readAllWords();
    const possibleWords = words.filter((x: any) => x.startsWith(q));
    console.log(possibleWords);
    if (possibleWords.length > 0) {
      const resp = responseModel(200, "Possible words", possibleWords);
      return res.status(200).json(resp);
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

app.get("/deprem", async (req: Request, res: Response) => {
  let query: any = req.query.city;
  const upperCaseQuery = query.toLocaleUpperCase("en-US");
  let city = upperCaseQuery
    .replace(/Ü/g, "U")
    .replace(/Ç/g, "C")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G");
  if (query) {
    const data = await filterByCity(city);
    if (data) {
      const resp = responseModel(200, "Earthquake data", data);
      return res.status(200).json(resp);
    } else {
      const resp = responseModel(400, "Earthquake data not found", null);
      return res.status(404).json(resp);
    }
  }
  const data = await getEarthquake();
  if (data) {
    const resp = responseModel(200, "Earthquake data", data);
    return res.status(200).json(resp);
  } else {
    const resp = responseModel(400, "Earthquake data not found", null);
    return res.status(404).json(resp);
  }
});

setInterval(writeWordToJson, 1000 * 60 * 60 * 24);

app.listen(5000, () => {
  console.log("server is running on port 3000");
});

export {router};
