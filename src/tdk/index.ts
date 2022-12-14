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
  const word = await fetch("https://sozluk.gov.tr/gts?ara=" + query);
  const response = await word.json();
  console.log(response);
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
