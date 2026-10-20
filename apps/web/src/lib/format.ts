const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export const hostFromUrl = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
