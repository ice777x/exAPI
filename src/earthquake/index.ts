import axios from "axios";

async function fetchData(): Promise<any> {
  const resp = await axios.get(
    "http://www.koeri.boun.edu.tr/scripts/lst2.asp",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );
  const data = await resp.data;
  return data;
}

async function getEarthquake(): Promise<any> {
  const data = await fetchData();
  const regex: RegExp =
    /(\d{4}\.\d{2}\.\d{2})\s(\d{2}:\d{2}:\d{2})\s\s(\d+\.\d*)\s*(\d*\.\d*)\s*(\d*\.\d*)\s*([-\.-|]+|[\d*\.\d*])\s*(\d*\.\d*)\s*([-\.-|]+|[\d*\.\d*])\s*(\w+-\w+\s\(\w+\)|\w*(\s\(\w*\))?)/g;
  const text = data.split("<pre>")[1].split("</pre>")[0];
  const results = text.match(regex).map((item: any) => {
    const data = item.split(/\s+/g);
    return {
      date: data[0],
      time: data[1],
      latitude: data[2],
      longitude: data[3],
      depth: data[4],
      magnitude: data[6],
      location: data.slice(8).join(" "),
    };
  });
  return results;
}

async function filterByCity(city: string): Promise<any> {
  const data = await getEarthquake();
  const filteredData = data.filter((item: any) => {
    return item.location.includes(city);
  });
  return filteredData;
}

export {getEarthquake, filterByCity};
