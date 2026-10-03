import { Router } from "express";
import { getMyPet, feedPet } from "../controllers/petController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-pet", authenticateToken, getMyPet);
router.post("/feed", authenticateToken, feedPet);

export default router;