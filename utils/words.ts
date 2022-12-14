import fs from "fs";

async function writeWordToJson() {
  if (fs.existsSync("words.json")) {
    try {
      fs.unlinkSync("words.json");
      const data = await getAllWords();
      fs.writeFileSync("lib/words.json", JSON.stringify(data), "utf8");
    } catch (err) {
      console.log(err);
      return;
    }
  } else {
    const data = await getAllWords();
    fs.writeFileSync("lib/words.json", JSON.stringify(data), "utf8");
  }
}
async function getAllWords() {
  const resp = await fetch("https://sozluk.gov.tr/autocomplete.json");
  const data = await resp.json();
  const result: string[] = data.map((x: any) => x.madde);
  return result.sort();
}

async function readAllWords(): Promise<any[]> {
  if (fs.existsSync("lib/words.json")) {
    const data = fs.readFileSync("lib/words.json", "utf8");
    return JSON.parse(data);
  } else {
    const data = await getAllWords();
    fs.writeFileSync("lib/words.json", JSON.stringify(data), "utf8");
    return data;
  }
}

interface ResponseModel {
  status: number;
  message: string;
  data: any;
}

function responseModel(
  status: number,
  message: string,
  data: any,
  ...args: any[]
): ResponseModel | any {
  const result = {status, message};
  if (data) {
    Object.assign(result, {data});
  }
  args.map((x) => {
    Object.assign(result, x);
  });
  return result;
}

export {writeWordToJson, readAllWords, responseModel};
