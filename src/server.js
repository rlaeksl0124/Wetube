import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddlewares } from "./middlewares";


const app = express();
const logger = morgan("dev");
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views")
app.use(logger);
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // string을 받아서 json으로 바꿔주는 미들웨어

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DB_URL})
}))

app.use(flash());
app.use(localsMiddlewares);
app.use("/", rootRouter);
app.use("/uploads", express.static("uploads"))
app.use("/static", express.static("assets"))
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);


export default app;