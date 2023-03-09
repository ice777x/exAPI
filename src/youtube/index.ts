import yts from "yt-search";
import ytdl, {getInfoOptions} from "ytdl-core";

const getVideoInfo = async (url: any) => {
  try {
    const info = await ytdl.getInfo(url, {lang: "tr"});
    const video = {
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      thumbnail: info.videoDetails.thumbnails.pop(),
      duration: +info.videoDetails.lengthSeconds,
      views: +info.videoDetails.viewCount,
      tags: info.videoDetails.keywords,
      author: info.videoDetails.author,
      source: info.formats
        .map((x: any) => {
          if ([18, 22, 251, 171, 250].includes(x.itag)) {
            return {
              tag: x.itag,
              url: x.url,
              quality: x.qualityLabel,
              audioQuality: x.audioQuality,
              contentLength: x.contentLength,
              audioChannels: x.audioChannels,
              ext: x.container,
              isLive: x.isLive,
              width: x.width,
              height: x.height,
              hasVideo: x.hasVideo,
              hasAudio: x.hasAudio,
            };
          }
        })
        .filter((x: any) => x),
      allFormats: info.formats.map((x: any) => {
        return {
          tag: x.itag,
          url: x.url,
          quality: x.qualityLabel,
          audioQuality: x.audioQuality,
          width: x.width,
          height: x.height,
          hasVideo: x.hasVideo,
          hasAudio: x.hasAudio,
          contentLength: x.contentLength,
          audioChannels: x.audioChannels,
          ext: x.container,
          isLive: x.isLive,
        };
      }),
      relatedVideos: info.related_videos.map((x: any) => {
        return {
          id: x.id,
          title: x.title,
          author: x.author,
          views: x.view_count,
          length: x.length_seconds,
          thumbnail: x.thumbnails[x.thumbnails.length - 1],
        };
      }),
    };
    return video;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const searchVideo = async (query: any) => {
  const data = await yts(query);

  const videos = data.all
    .map((x: any) => {
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
          author: x.author,
          meta_source: `/youtube/${x.videoId}`,
        };
      } else return null;
    })
    .filter((x: any) => x);
  return videos;
};

export {getVideoInfo, searchVideo};
