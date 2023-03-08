import yts from "yt-search";
import ytdl from "ytdl-core";

const getVideoInfo = async (url: any) => {
  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          "user-agent": "googlebot",
          referer: "youtube.com",
        },
      },
    });

    const player_response = info.player_response;
    const video = {
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      thumbnail: info.videoDetails.thumbnails.pop(),
      duration: +info.videoDetails.lengthSeconds,
      tags: info.videoDetails.keywords,
      viewCount: info.videoDetails.viewCount,
      shortView:
        // @ts-ignore
        info.response.contents.twoColumnWatchNextResults.results.results
          .contents[0].videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer
          .shortViewCount.simpleText,
      // @ts-ignore
      date: info.response.contents.twoColumnWatchNextResults.results.results
        .contents[0].videoPrimaryInfoRenderer.dateText.simpleText,
      length: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author,
      source: player_response.streamingData.formats.map((x: any) => {
        return {
          url: x.url,
          quality: x.qualityLabel,
          type: x.mimeType,
          size: x.contentLength,
          bitrate: x.bitrate,
        };
      }),
      allFormats: info.formats.map((x: any) => {
        return {
          url: x.url,
          quality: x.qualityLabel,
          width: x.width,
          height: x.height,
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
