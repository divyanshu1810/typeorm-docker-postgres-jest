import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import * as morgan from "morgan";
import { validationResult } from "express-validator/src/validation-result";

function handleError(err, _req, res, _next) {
  res.status(err.statusCode || 500).send({ message: err.message });
}

const app = express();
app.use(morgan("tiny"));
app.use(bodyParser.json());

// register express routes from defined application routes
Routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    ...route.validation,
    async (req: Request, res: Response, next: Function) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const result = await new (route.controller as any)()[route.action](
          req,
          res,
          next
        );
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
});

// start express server
app.use(handleError);

export default app;
