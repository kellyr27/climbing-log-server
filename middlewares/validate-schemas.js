import Joi from 'joi';

const validateSchemas = (schemas) => {
  return (req, res, next) => {
    try {
      const validationResults = [];

      // Validate each schema
      for (const [key, schema] of Object.entries(schemas)) {
        const { error } = schema.validate(req.body[key]);
        if (error) {
          validationResults.push({ key, error });
        }
      }

      // If there are validation errors, throw an error
      if (validationResults.length > 0) {
        const error = new Error('Invalid request data');
        error.status = 400;
        error.details = validationResults;
        throw error;
      }

      next();
    } catch (error) {
      next(error); // Pass the error to the next middleware
    }
  };
};

export default validateSchemas;