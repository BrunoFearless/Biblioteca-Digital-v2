export class HttpError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function handleRouteError(res, error, defaultMessage) {
  if (error?.status) {
    return res.status(error.status).json({ error: error.message });
  }

  return res.status(500).json({
    error: defaultMessage,
    details: error?.message
  });
}
