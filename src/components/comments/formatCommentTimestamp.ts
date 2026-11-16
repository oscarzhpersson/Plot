const timestamp = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCommentTimestamp(createdAt: string) {
  return timestamp.format(new Date(createdAt));
}
