import ytdl from "ytdl-core";
import yts from "yt-search";

const getVideoInfo = async (url: any) => {
  try {
    const info = await ytdl.getInfo(url);

    const player_response = info.player_response;
    const video = {
      id: player_response.videoDetails.videoId,
      title: player_response.videoDetails.title,
      description: player_response.videoDetails.shortDescription,
      thumbnail:
        // @ts-ignore
        player_response.videoDetails.thumbnail.thumbnails[
          // @ts-ignore
          player_response.videoDetails.thumbnail.thumbnails.length - 1
        ].url,
      duration: player_response.videoDetails.lengthSeconds,
      views: player_response.videoDetails.viewCount,
      author: player_response.videoDetails.author,
      source: player_response.streamingData.formats.map((x: any) => {
        return {
          url: x.url,
          quality: x.qualityLabel,
          type: x.mimeType,
          size: x.contentLength,
          bitrate: x.bitrate,
        };
      }),
    };
    return video;
  } catch (e) {
    return false;
  }
};

const searchVideo = async (query: any) => {
  const data = await yts(query);
  const videos = data.all.map((x: any) => {
    if (x.type == "video") {
      return {
        title: x.title,
        url: x.url,
        video_id: x.videoId,
        description: x.description,
        thumbnail: x.thumbnail,
        published: x.ago,
        duration: x.duration,
        views: x.views,
        meta_source: `/youtube/${x.videoId}`,
      };
    } else return null;
  });
  videos.splice(videos.indexOf(null), 1);
  return videos;
};

export {getVideoInfo, searchVideo};
