/**
 * Configuration object for Umami analytics.
 *
 * @see https://umami.is/docs/tracker-configuration
 */
export const umamiConfig = {
  /**
   * The URL of the tracker script.
   *
   * @see https://umami.is/docs/tracker-configuration#data-host-url
   */
  src: "https://analy.yfi.moe/script.js",
  /**
   * The website ID used in data-website-id attribute.
   *
   * @see https://umami.is/docs/tracker-configuration
   */
  websiteId: "3c89f8f6-9432-4ceb-a404-f22f2b0cf94d",
  /**
   * The domains to track.
   *
   * @see https://umami.is/docs/tracker-configuration#data-domains
   */
  domains: ["yfi.moe"],
};

/**
 * Google Analytics Measurement ID.
 *
 * @see https://support.google.com/analytics/answer/12270356
 */
export const googleMeasurementId: string = "G-1MPEY5XJ9V";
