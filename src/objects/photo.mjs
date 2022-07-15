import exp from "constants";
import crypto from "crypto";
import path from "path";

export async function getPhotoByCategory(req, res, utils_vars) {
  const photosRef = utils_vars.db.collection("photos");

  const photos = await photosRef
    .where("category", "==", req.params.id)
    .get()
    .then((photos) => {
      const data = photos.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      return data;
    });
  res.send(photos);
}

export async function getPhotos(req, res, utils_vars) {
  const photos = await utils_vars.db
    .collection("photos")
    .get()
    .then((photos) => {
      const data = photos.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      return data;
    });
  res.send(photos);
}

export async function addPhoto(req, res, utils_vars) {
  let content = req.body;
  const docRef = utils_vars.db.collection("photos").doc(Date.now().toString());

  const name = crypto.randomBytes(16).toString("hex");
  content.fileName = name + path.extname(req.file.originalname);
  utils_vars.app.locals.bucket
    .file(content.fileName)
    .createWriteStream()
    .end(req.file.buffer)
    .on("finish", async () => {
      const storage = utils_vars.admin.storage();
      const ref = storage
        .bucket(`gs://${process.env.BUCKET_NAME}`)
        .file(content.fileName);
      const url = await ref.getSignedUrl({
        action: "read",
        expires: "01-01-2500",
      });
      content.url = url[0];
      docRef.set(content);
      res.status(200).json({ message: "Photo added successfully" });
    });
}

export async function deletePhoto(req, res, utils_vars) {
  const docRef = utils_vars.db.collection("photos").doc(req.params.id);
  docRef.get().then((doc) => {
    if (doc.exists) {
      utils_vars.app.locals.bucket.file(doc.data().fileName).delete();
    } else {
      res.status(404).send("Document not found");
    }
  });
  docRef.delete();
  res.status(200);
}

export async function updatePhoto(req, res, utils_vars) {
  const docRef = utils_vars.db.collection("photos").doc(req.params.id);
  try {
    docRef.update(req.body);
  } catch (error) {
    res.status(500).send(error);
  }
  res.status(200);
}
