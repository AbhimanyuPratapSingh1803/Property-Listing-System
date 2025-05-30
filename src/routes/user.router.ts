import { Router } from "express";
import { registerUser, loginUser, logoutUser, addFavorite, getFavorites, removeFavorite, recommendProperty, addProperty, updateProperty, deleteProperty } from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/addFavorite/:propertyId").post(verifyJwt, addFavorite);
router.route("/getFavorites").get(verifyJwt, getFavorites);
router.route("/removeFavorite/:propertyId").post(verifyJwt, removeFavorite);
router.route("/recommend").post(verifyJwt, recommendProperty)
router.route("/add").post(verifyJwt, addProperty)
router.route("/update/:propertyId").post(verifyJwt, updateProperty)
router.route("/delete/:propertyId").post(verifyJwt, deleteProperty)

export default router;