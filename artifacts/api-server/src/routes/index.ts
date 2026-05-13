import { Router, type IRouter } from "express";
import healthRouter from "./health";
import presentersRouter from "./presenters";
import showsRouter from "./shows";
import postsRouter from "./posts";
import galleryRouter from "./gallery";
import scheduleRouter from "./schedule";
import newsletterRouter from "./newsletter";
import contactRouter from "./contact";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(presentersRouter);
router.use(showsRouter);
router.use(postsRouter);
router.use(galleryRouter);
router.use(scheduleRouter);
router.use(newsletterRouter);
router.use(contactRouter);
router.use(statsRouter);

export default router;
