const escapeRegex = (val: string): string =>
  val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export { escapeRegex };
