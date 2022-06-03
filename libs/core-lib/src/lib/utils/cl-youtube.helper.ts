/**
 * Helper to manager youtube urls
 */
export class ClYoutubeHelper {

  public static readonly youtubeVideoUrl: string = 'https://www.youtube.com/watch?v=';
  public static readonly youtubeEmbedVideoUrl: string = 'https://www.youtube.com/embed/';


  public static convertToEmbedUrl(url: string): string | null {
    const youtubeVideoId = ClYoutubeHelper.getYoutubeVideoId(url);

    if (youtubeVideoId == null) {
      return null;
    }
    return ClYoutubeHelper.youtubeEmbedVideoUrl + youtubeVideoId;
  }

  public static getYoutubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    } else {
      return null;
    }
  }

  public static isYoutubeEmbedVideoUrl(url: string): boolean {
    return url.startsWith(ClYoutubeHelper.youtubeEmbedVideoUrl);
  }

  public static isYoutubeVideoUrl(url: string): boolean {
    return url.startsWith(ClYoutubeHelper.youtubeVideoUrl);
  }

  public static isYoutubeVideoOrEmbedUrl(url: string): boolean {
    return ClYoutubeHelper.isYoutubeVideoUrl(url) || ClYoutubeHelper.isYoutubeEmbedVideoUrl(url);
  }
}
