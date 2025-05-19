import express from 'express'
import cors from 'cors'
import { env } from './config/environment.js'
import { APIs_V1 } from './routes/v1/index.js'
import { corsOptions } from './config/cors.js'
import session from 'express-session';
import passport from 'passport';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import cookieParser from 'cookie-parser'
import {GoogleLoginProvider} from './providers/GoogleLoginProvider.js'
import './utils/imageCleaner.js';

const START_SERVER = async () => {
  const app = express();
  app.use(cors(corsOptions));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  })
  app.use(cookieParser());
  app.use(express.json());
  app.use(session({
    secret: env.SECRET_KEY_SESSION, // đổi thành chuỗi bí mật của bạn
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  GoogleLoginProvider.handleLoginWithGoogle()
  app.use('/v1', APIs_V1);
  app.use(errorHandlingMiddleware);
  if(env.BUILD_MODE === "production") {
    app.listen(process.env.PORT, () => {
      console.log(`Example app listening on port ${process.env.PORT}`)
    })
  } else app.listen(env.APP_PORT, () => {
    console.log(`Example app listening on port ${env.APP_PORT}`)
  })

}

START_SERVER()