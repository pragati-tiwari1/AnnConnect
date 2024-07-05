import React, { useEffect, useState } from "react";
import { query,addDoc, collection, getDocs, updateDoc,where ,doc,getDoc } from "firebase/firestore"; 
import { db } from "./firebase";
import { useAuth } from "./AuthProvider";


export const ListedFood = () =>  {
  const [cars, setCars] = useState([]);
  const [need, setNeed] = useState("");
  const [con, setCon] = useState("");
  const [nam, setName] = useState("");
  const {currentUser} = useAuth();

  useEffect(() => {
    async function fetchData() {
      const carsData = [];
      const querySnapshot1 = collection(db, "userDonorids");
      const val = await getDocs(querySnapshot1);
      
      for (const doc of val.docs) {
        const x = doc.data().Userid;
        const eventcoll = query(collection(db, "userDonor/" + x + "/" + "Events"), where("servings", "!=", ""));
        const eve = await getDocs(eventcoll);

        eve.forEach((dd) => {
          carsData.push({
            id: dd.id,
            uidd : doc.data().Userid,
            name: dd.data().name,
            address: dd.data().address,
            date: dd.data().date,
            servings: dd.data().servings,
            on: dd.data().on,
            flag : false,
          });
        });
      }

      setCars(carsData);
    }

    fetchData();
  }, []);

  const handleAddFood = async (idx, id ,uidd) => {
    
    if(con === "" || nam === "" || need === "") {
      alert("feel all details");
      return;
    }

    console.log(uidd + " / " + id);
    const querySnapshot = await getDoc(
      doc(db, "userDonor/" + uidd + "/" + "Events" +"/" +id )
    );
    
    console.log(querySnapshot.data().servings);
    console.log(need);

    let y = querySnapshot.data().servings - need; 
    console.log(y);

    try {
      const eventDoc = doc(db, "userDonor/" + uidd + "/" + "Events", id);
      await updateDoc(eventDoc, { servings  : y });
    } catch (error) {
      console.error('Error updating document: ', error);
    }

    try {

      await addDoc(collection(db, 'userFeeder/' + currentUser.uid +"/"+ "AddedFood"), {
        uidd,
        id,
        need,
        nam,
        con,
      });
     
      setCars(prevCars => {
        const newCars = [...prevCars];
        newCars[idx].flag = true;
        return newCars;
      });


    } catch (error) {
      console.error('Error adding document: ', error);
    }

  };

  return (
    <div>
      <h2>Listed Food From All Donors</h2>
      <table border="2px">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Date</th>
            <th>No. Of Servings</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Needed Serving</th>
            <th>Add</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car, index) => (
            <tr key={index}>
              <td>{car.name}</td>
              <td>{car.address}</td>
              <td>{car.date}</td>
              <td>{car.servings}</td>
              <td>
                <input
                  type="text"
                  placeholder="Name"
                  onChange={(e) => setName(e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Contact No"
                  onChange={(e) => setCon(e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Serving Needed"
                  onChange={(e) => setNeed(e.target.value)}
                />
              </td>
              <td>
              <button onClick={() => handleAddFood(index, car.id, car.uidd)} disabled={car.flag}> {car.flag ? "Added" : "Add Food"} </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
