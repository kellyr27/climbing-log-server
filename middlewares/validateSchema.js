const validateSchema = (joiSchema) => {
  return (req, res, next) => {
    try {
      const { error } = joiSchema.validate(req.body);
      if (error) {
        const error = new Error("Invalid request data");
        error.status = 400;
        throw error;
      }
      next();
    } catch (error) {
      next(error); // Pass the error to the next middleware
    }
  };
};

export default validateSchema;