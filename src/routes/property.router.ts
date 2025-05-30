import { Router } from "express";
import { fetchProperties } from "../controllers/property.controller";

const router = Router();

router.route("/getProperties").get(fetchProperties);

export default router;