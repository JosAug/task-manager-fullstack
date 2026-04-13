export function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
}

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: formatZodIssues(result.error),
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        details: formatZodIssues(result.error),
      });
    }
    req.validatedParams = result.data;
    next();
  };
}

export function validateRequest({ params: paramsSchema, body: bodySchema }) {
  return (req, res, next) => {
    if (paramsSchema) {
      const pr = paramsSchema.safeParse(req.params);
      if (!pr.success) {
        return res.status(400).json({
          error: "Parâmetros inválidos",
          details: formatZodIssues(pr.error),
        });
      }
      req.validatedParams = pr.data;
    }
    if (bodySchema) {
      const br = bodySchema.safeParse(req.body);
      if (!br.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: formatZodIssues(br.error),
        });
      }
      req.validatedBody = br.data;
    }
    next();
  };
}
