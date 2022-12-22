import ytdl from "ytdl-core";

const getVideoInfo = async (url: string) => {
  const info = await ytdl.getInfo(url);
  return info;
};

export {getVideoInfo};
