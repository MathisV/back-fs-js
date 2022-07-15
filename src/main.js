import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";
import * as functions from 'firebase-functions';
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import compression from "compression";
import multer from "multer";
import serviceAccount from "../creds.json" assert { type: "json" };
import * as dotenv from "dotenv";

import {
  getPhotoByCategory,
  getPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto,
} from "./objects/photo.mjs";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./objects/category.mjs";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  authenticateUser,
  isAuthenticated,
  logout,
} from "./objects/users.mjs";

dotenv.config();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 3000;
const app = express();

// Express configuration
app.use(cors());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use("/", express.static("public"));

initializeApp({
  ...functions.config().firebase,
  credential: cert(serviceAccount),
  storageBucket: "thom-b6fe9.appspot.com",
});
app.locals.bucket = admin.storage().bucket();
const db = getFirestore();

const utils_vars = { admin, app, db };

// Routes

app
  .route("/photos")
  .get(async (req, res) => {
    await getPhotos(req, res, utils_vars);
  })
  .post(upload.single("file"), async (req, res) => {
    await addPhoto(req, res, utils_vars);
  });

app
  .route("/photos/:id")
  .get(async (req, res) => {
    await getPhotoByCategory(req, res, utils_vars);
  })
  .patch(async (req, res) => {
    await updatePhoto(req, res, utils_vars);
  })
  .delete(async (req, res) => {
    await deletePhoto(req, res, utils_vars);
  });

app
  .route("/categories")
  .get(async (req, res) => {
    await getCategories(req, res, utils_vars);
  })
  .post(async (req, res) => {
    await addCategory(req, res, utils_vars);
  });

app
  .route("/categories/:id")
  .delete(async (req, res) => {
    await deleteCategory(req, res, utils_vars);
  })
  .patch(async (req, res) => {
    await updateCategory(req, res, utils_vars);
  });

app
  .route("/users")
  .get(async (req, res) => {
    await getUsers(req, res, utils_vars);
  })
  .post(async (req, res) => {
    await addUser(req, res, utils_vars);
  });

app
  .route("/users/:id")
  .delete(async (req, res) => {
    await deleteUser(req, res, utils_vars);
  })
  .patch(async (req, res) => {
    await updateUser(req, res, utils_vars);
  });

app.route("/login").post(async (req, res) => {
  await authenticateUser(req, res, utils_vars);
});

app.route("/login/:token").get(async (req, res) => {
  await isAuthenticated(req, res, utils_vars);
});

app.route("/logout/:token").get(async (req, res) => {
  await logout(req, res, utils_vars);
});

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

export const webApi = functions.region('europe-west1').https.onRequest(app);