import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";

export function getUsers(req, res, utils_vars) {
  utils_vars.db
    .collection("users")
    .get()
    .then((users) => {
      const data = users.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      res.send(data);
    });
}

export function addUser(req, res, utils_vars) {
  var size = 1;
  var notExist = true;
  utils_vars.db
    .collection("users")
    .get()
    .then((users) => {
      users.docs.map((doc) => {
        size += 1;
        if (doc.data().username == req.body.username) {
          notExist = false;
        }
      });
    })
    .then(() => {
      if (notExist) {
        const docRef = utils_vars.db.collection("users").doc("" + size);
        req.body.password = crypto
          .createHash("sha256")
          .update(req.body.password)
          .digest("hex");
        docRef.set(req.body);
        res.status(200).json({ "message": "Added" });
      } else {
        res.status(400).json({"message": "User already exist"});
      }
    });
}

export async function deleteUser(req, res, utils_vars) {
  const userRef = utils_vars.db.collection("users").doc(req.params.id);
  userRef.delete();
  res.status(200).json({"message": "Deleted"});
}

export async function updateUser(req, res, utils_vars) {
  var notExist = true;
  utils_vars.db
    .collection("users")
    .get()
    .then((users) => {
      users.docs.map((doc) => {
        if (
          doc.data().username == req.body.username &&
          doc.id != req.params.id
        ) {
          notExist = false;
        }
      });
    })
    .then(() => {
      if (notExist) {
        const userRef = utils_vars.db.collection("users").doc(req.params.id);
        req.body.password = crypto
          .createHash("sha256")
          .update(req.body.password)
          .digest("hex");
        req.body.id = FieldValue.delete();
        userRef.update(req.body);
        res.status(200).json({"message": "Updated"});
      } else {
        res.status(400).send("Username already exists");
      }
    });
}

export async function getUser(req, res, utils_vars) {
  const userRef = utils_vars.db.collection("users");

  const user = await userRef
    .where("username", "==", req.params.username)
    .get()
    .then((photos) => {
      const data = user.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      return data;
    });
  res.send(photos);
}

async function getUserLocal(utils_vars, username) {
  const userRef = utils_vars.db.collection("users");

  const user = await userRef
    .where("username", "==", username)
    .get()
    .then((u) => {
      const data = u.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      return data;
    });
  return user;
}

async function updateUserLocal(utils_vars, json) {
  const userRef = utils_vars.db.collection("users").doc(json.id);
  json.id = FieldValue.delete();
  await userRef.update(json);
}

export async function isAuthenticated(req, res, utils_vars) {
  const userRef = utils_vars.db.collection("users");
  await userRef
    .where("token", "==", req.params.token)
    .get()
    .then((u) => {
      const data = u.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (data.length == 1 && data[0].token != "logout") {
        res.status(200).json({"message": "Authenticated"});
      } else {
        res.status(400).json({"message": "Not authenticated"});
      }
    });
}

export async function logout(req, res, utils_vars) {
  const userRef = utils_vars.db.collection("users");
  await userRef
    .where("token", "==", req.params.token)
    .get()
    .then((u) => {
      const data = u.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (data.length == 1 && data[0].token != "logout") {
        data[0].token = "logout";
        updateUserLocal(utils_vars, data[0]);
        res.status(200).json({"message": "Logout"});
      } else {
        res.status(400).json({"message": "Not authenticated"});
      }
    });
}

export async function authenticateUser(req, res, utils_vars) {
  const user = await getUserLocal(utils_vars, req.body.username);
  if (user.length > 0) {
    const cryptedPassword = crypto
      .createHash("sha256")
      .update(req.body.password)
      .digest("hex");
    if (user[0].password === cryptedPassword) {
      res.status(200);
      const token = crypto
        .createHash("sha256")
        .update(user[0].username + "-" + Date.now())
        .digest("hex");
      user[0].token = token;
      updateUserLocal(utils_vars, user[0]);
      res
        .status(200)
        .json({"token": token});
    } else {
      res.status(401).json({"msg": "Password incorrect"});
    }
  } else {
    res.status(401).json({"msg": "User not found"});
  }
}
