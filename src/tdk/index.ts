import axios from "axios";
interface Word {
  kelime: string | null;
  lisan: string | null;
  telaffuz: string | null;
  ozel: boolean | null;
  cogul: boolean | null;
  eng_kelime: string | null;
  anlam: string[] | null;
  atasozu: string[] | null;
}

async function getWord(query: any): Promise<Word[] | null> {
  const word = await axios.get(`https://sozluk.gov.tr/gts?ara=${query}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      referer: "https://sozluk.gov.tr/",
      "Content-Type": "application/json",
    },
  });
  const response = await word.data;
  if (response.error) return null;
  const result: Word[] | null = response.map((x: any, i: number) => {
    let atasozleri = null;
    let anlamlar = null;
    if (x.atasozu) {
      atasozleri = x.atasozu.map((item: any) => {
        return item.madde;
      });
    }

    if (x.anlamlarListe) {
      anlamlar = x.anlamlarListe.map((item: any) => {
        return item.anlam;
      });
    }
    return {
      kelime: response[0].madde,
      lisan: response[0].lisan,
      telaffuz: response[0].telaffuz,
      ozel: response[0].ozel_mi == "0" ? false : true,
      cogul: response[0].cogul_mu == "0" ? false : true,
      eng_kelime: response[0].madde_duz,
      anlam: anlamlar,
      atasozu: atasozleri,
    };
  });
  return result;
}

export {getWord};
