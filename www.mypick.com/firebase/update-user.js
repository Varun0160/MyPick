import { app, auth, db, storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function updateUser({ email, name, surname, phoneNumber, photo, finalEvent }) {
  const currentUser = auth.currentUser.uid;

  if (photo) {
    const storageRef = ref(storage, "images/" + currentUser + (photo?.name || "0"));

    return uploadBytes(storageRef, photo).then(() => {
      getDownloadURL(storageRef).then((url) => {
        db.collection("Users")
          .doc(currentUser)
          .update({
            name,
            surname,
            email,
            phoneNumber: phoneNumber || "",
            photoUrl: url,
          })
          .catch((e) => console.error("Error updating user:", e))
          .finally(() => finalEvent());
      });
    }).catch((e) => console.error("Error uploading photo:", e));
  }

  return db.collection("Users").doc(currentUser).update({
    name,
    surname,
    email,
    phoneNumber: phoneNumber || "",
  });
}

function updatePassword({ currentPassword, newPassword }) {
  const currentUser = auth.currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    currentUser.email,
    currentPassword
  );

  const update = () => {
    return currentUser.updatePassword(newPassword);
  };

  const reauth = () => {
    return currentUser.reauthenticateWithCredential(credential);
  };

  return { reauth, update };
}

export { updateUser, updatePassword };
