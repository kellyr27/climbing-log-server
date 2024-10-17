const errorHandlerMiddleware = (err, req, res, next) => {
  if (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "An unexpected error occurred" });
  } else {
    next();
  }
};

export default errorHandlerMiddleware;
