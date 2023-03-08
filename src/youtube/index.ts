import yts from "yt-search";
import youtubeDl from "youtube-dl-exec";

const getVideoInfo = async (url: any) => {
  try {
    const output = await youtubeDl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      skipDownload: true,
      format: "171, 251, 18, 22",
      addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    });
    const date_regexp = /(\d{4})(\d{2})(\d{2})/g;
    const date = date_regexp.exec(output.upload_date)?.slice(1, 4).join("-");

    const alternate_object: {video: any[]; audio: any[]} = {
      video: [],
      audio: [],
    };
    // @ts-ignore
    output.requested_downloads.forEach((x: any) => {
      if (x.video_ext === "none") {
        alternate_object.audio.push({
          format: x.format,
          format_note: x.format_note,
          url: x.url,
          filesize: x.filesize_approx,
          audio_channels: x.audio_channels,
          resolution: x.resolution,
          video_ext: x.video_ext,
          audio_ext: x.audio_ext,
        });
      } else {
        alternate_object.video.push({
          format: x.format,
          format_note: x.format_note,
          url: x.url,
          filesize: x.filesize_approx,
          audio_channels: x.audio_channels,
          resolution: x.resolution,
          video_ext: x.video_ext,
          audio_ext: x.audio_ext,
        });
      }
    });
    const result = {
      id: output.id,
      title: output.title,
      thumbnail: output.thumbnail,
      original_url: output.webpage_url,
      description: output.description,
      channel: {
        name: output.uploader,
        id: output.uploader_id,
        url: output.uploader_url,
        // @ts-ignore
        followers: output.channel_follower_count,
      },
      url: output.url,
      resolution: output.width + "x" + output.height,
      duration: {
        // @ts-ignore
        duration_string: output.duration_string,
        duration_number: output.duration,
      },
      upload_date: date ? date : output.upload_date,
      categories: output.categories ? output.categories : [],
      tags: output.tags ? output.tags : [],
      view_count: output.view_count,
      like_count: output.like_count,
      formats: alternate_object,
      // @ts-ignore
      filesize: output.filesize || output.filesize_approx,
      alternateFormats: output.formats
        .map((x: any) => {
          if (x.audio_ext === "none" && x.video_ext === "none") return;
          return {
            format: x.format,
            format_note: x.format_note,
            url: x.url,
            filesize: x.filesize,
            audio_channels: x.audio_channels,
            resolution: x.resolution,
            video_ext: x.video_ext,
            audio_ext: x.audio_ext,
          };
        })
        .filter((x: any) => x),
    };
    return result;
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
