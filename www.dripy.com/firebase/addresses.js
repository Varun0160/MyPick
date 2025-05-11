import { db, auth } from "../config/firebase";
import { doc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const addAddress = async ({ title, city, region, zipcode, full_address }) => {
  try {
    // Add address to 'Addresses' collection
    const addressRef = await setDoc(doc(db, "Addresses", new Date().toISOString()), {
      title,
      city,
      region,
      zipcode,
      full_address,
    });

    // Add address ID to user's address array
    await updateDoc(doc(db, "Users", auth.currentUser.uid), {
      addresses: arrayUnion(addressRef.id),
    });
  } catch (error) {
    console.error("Error adding address:", error);
  }
};

const updateAddress = async ({ id, title, city, region, zipcode, full_address }) => {
  try {
    // Update address in 'Addresses' collection
    await updateDoc(doc(db, "Addresses", id), {
      title,
      city,
      region,
      zipcode,
      full_address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
  }
};

const deleteAddress = async ({ id }) => {
  try {
    // Delete address from 'Addresses' collection
    await deleteDoc(doc(db, "Addresses", id));

    // Remove address ID from user's address array
    await updateDoc(doc(db, "Users", auth.currentUser.uid), {
      addresses: arrayRemove(id),
    });
  } catch (error) {
    console.error("Error deleting address:", error);
  }
};

export { addAddress, updateAddress, deleteAddress };
