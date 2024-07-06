import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import StoreImageTextFirebase from "./StoreImageTextFirebase";

import "./Registration.css";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase";

function Registration() {
  const { currentUser } = useAuth();
  const [img, setImg] = useState("");
  const [flag, setFlag] = useState(true);
  const navigate = useNavigate();
  // class to store data
  const [formData, setFormData] = useState({
    userId: "",
    userType: "",
    organizationName: "",
    name: "",
    address: "",
    mobileNo: "",
    registrationId: "",
    agreedToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  async function writeUserData(urlll, uid, uty, on, nam, add, no, rid, ag, tp) {
    try {
       await setDoc(doc(db, "user" + tp + "/" + uid), {
        userType: uty,
        organizationName: on,
        name: nam,
        address: add,
        mobileNo: no,
        registrationId: rid,
        pdfURL: urlll,
        agreedToTerms: ag,
      });

     
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    try {
      await addDoc(collection(db, "user" + tp + "ids"), {
        Userid: uid,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.userType ||
      !formData.organizationName ||
      !formData.name ||
      !formData.address ||
      !formData.mobileNo ||
      !formData.registrationId ||
      !formData.agreedToTerms
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Prepare data to be stored in Firebase RTDB
    const dataToSave = {
      userId: currentUser.uid,
      userType: formData.userType,
      organizationName: formData.organizationName,
      name: formData.name,
      address: formData.address,
      mobileNo: formData.mobileNo,
      registrationId: formData.registrationId,
      pdfurl: img,
      agreedToTerms: formData.agreedToTerms,
    };

    try {
      if (dataToSave.userType === "Feeder") {
        writeUserData(
          dataToSave.pdfurl,
          dataToSave.userId,
          dataToSave.userType,
          dataToSave.organizationName,
          dataToSave.name,
          dataToSave.address,
          dataToSave.mobileNo,
          dataToSave.registrationId,
          dataToSave.agreedToTerms,
          "Feeder"
        );
      } else {
        writeUserData(
          dataToSave.pdfurl,
          dataToSave.userId,
          dataToSave.userType,
          dataToSave.organizationName,
          dataToSave.name,
          dataToSave.address,
          dataToSave.mobileNo,
          dataToSave.registrationId,
          dataToSave.agreedToTerms,
          "Donor"
        );
      }
      // Save data to Firebase RTDB

      // Handle successful form submission
      alert("Form submitted successfully!");

      if (formData.userType === "Donor") {
        navigate("/Donor");
      } else {
        navigate("/Ngo");
      }

      setFormData({
        userType: "",
        organizationName: "",
        name: "",
        address: "",
        mobileNo: "",
        registrationId: "",
        agreedToTerms: false,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again later.");
    }
  };
  return (
    <div>
      <form action="">
        <div className="registration">
          <h4>
            <b>Registration Form </b>
          </h4>
          {/* <p>{currentUser.email}</p> */}

          <div>
            <label>User Type:</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="Feeder">Feeder</option>
              <option value="Donor">Donor</option>
            </select>
          </div>
          <div>
            <label>Organization Name:</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Mobile No.:</label>
            <input
              type="tel"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Registration ID:</label>
            <input
              type="text"
              name="registrationId"
              value={formData.registrationId}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Upload Required Document:</label>
            <StoreImageTextFirebase setImg={setImg} setFlag={setFlag} />
            <p>{img}</p>
          </div>
        </div>
        <div>
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            required
          />
          <label>I agree to the terms and conditions</label>
        </div>
        <div>
          <button id="rty" type="submit" disabled={flag} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Registration;
