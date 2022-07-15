export async function getCategories(req, res, utils_vars) {
  utils_vars.db
    .collection("categories")
    .get()
    .then((categories) => {
      const data = categories.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      res.send(data);
    });
}

export async function addCategory(req, res, utils_vars) {
  let size = 0;
  utils_vars.db
    .collection("categories")
    .get()
    .then((categories) => {
      categories.docs.map((doc) => {
        size += 1;
      });
    })
    .then(() => {
      const docRef = utils_vars.db.collection("categories").doc("" + size);
      docRef.set(req.body);
      res.status(200).json({ "message": "Added" });
    });
}

export async function deleteCategory(req, res, utils_vars) {
  const docRef = utils_vars.db.collection("categories").doc(req.params.id);
  docRef.delete();
  res.status(200).json({"message": "Deleted"});
}

export async function updateCategory(req, res, utils_vars) {
  const docRef = utils_vars.db.collection("categories").doc(req.params.id);
  docRef.update(req.body);
  res.status(200).json({"message": "Updated"});
}
