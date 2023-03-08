import yts from "yt-search";
import youtubeDl from "youtube-dl-exec";
import ytdl from "ytdl-core";

// const getVideoInfo = async (url: any) => {
//   try {
//     const output = await youtubeDl(url, {
//       dumpSingleJson: true,
//       noWarnings: true,
//       noCheckCertificates: true,
//       preferFreeFormats: true,
//       youtubeSkipDashManifest: true,
//       skipDownload: true,
//       format: "171, 251, 18, 22",
//       addHeader: ["referer:youtube.com", "user-agent:googlebot"],
//     });
//     const date_regexp = /(\d{4})(\d{2})(\d{2})/g;
//     const date = date_regexp.exec(output.upload_date)?.slice(1, 4).join("-");

//     const alternate_object: {video: any[]; audio: any[]} = {
//       video: [],
//       audio: [],
//     };
//     // @ts-ignore
//     output.requested_downloads.forEach((x: any) => {
//       if (x.video_ext === "none") {
//         alternate_object.audio.push({
//           format: x.format,
//           format_note: x.format_note,
//           url: x.url,
//           filesize: x.filesize_approx,
//           audio_channels: x.audio_channels,
//           resolution: x.resolution,
//           video_ext: x.video_ext,
//           audio_ext: x.audio_ext,
//         });
//       } else {
//         alternate_object.video.push({
//           format: x.format,
//           format_note: x.format_note,
//           url: x.url,
//           filesize: x.filesize_approx,
//           audio_channels: x.audio_channels,
//           resolution: x.resolution,
//           video_ext: x.video_ext,
//           audio_ext: x.audio_ext,
//         });
//       }
//     });
//     const result = {
//       id: output.id,
//       title: output.title,
//       thumbnail: output.thumbnail,
//       original_url: output.webpage_url,
//       description: output.description,
//       channel: {
//         name: output.uploader,
//         id: output.uploader_id,
//         url: output.uploader_url,
//         // @ts-ignore
//         followers: output.channel_follower_count,
//       },
//       url: output.url,
//       resolution: output.width + "x" + output.height,
//       duration: {
//         // @ts-ignore
//         duration_string: output.duration_string,
//         duration_number: output.duration,
//       },
//       upload_date: date ? date : output.upload_date,
//       categories: output.categories ? output.categories : [],
//       tags: output.tags ? output.tags : [],
//       view_count: output.view_count,
//       like_count: output.like_count,
//       formats: alternate_object,
//       // @ts-ignore
//       filesize: output.filesize || output.filesize_approx,
//       alternateFormats: output.formats
//         .map((x: any) => {
//           if (x.audio_ext === "none" && x.video_ext === "none") return;
//           return {
//             format: x.format,
//             format_note: x.format_note,
//             url: x.url,
//             filesize: x.filesize,
//             audio_channels: x.audio_channels,
//             resolution: x.resolution,
//             video_ext: x.video_ext,
//             audio_ext: x.audio_ext,
//           };
//         })
//         .filter((x: any) => x),
//     };
//     return result;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// };

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
      id: player_response.videoDetails.videoId,
      title: player_response.videoDetails.title,
      description: player_response.videoDetails.shortDescription,
      thumbnail:
        // @ts-ignore
        player_response.videoDetails.thumbnail.thumbnails[
          // @ts-ignore
          player_response.videoDetails.thumbnail.thumbnails.length - 1
        ],
      duration: +player_response.videoDetails.lengthSeconds,
      tags: player_response.videoDetails.keywords,
      viewCount: player_response.videoDetails.viewCount,
      shortView:
        // @ts-ignore
        info.response.contents.twoColumnWatchNextResults.results.results
          .contents[0].videoPrimaryInfoRenderer.viewCount.videoViewCountRenderer
          .shortViewCount.simpleText,
      // @ts-ignore
      date: info.response.contents.twoColumnWatchNextResults.results.results
        .contents[0].videoPrimaryInfoRenderer.dateText.simpleText,
      length: player_response.videoDetails.lengthSeconds,
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
