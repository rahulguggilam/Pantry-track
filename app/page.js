"use client";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [itemName, setItemName] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = await getDocs(collection(firestore, "Pantry"));
    const pantryList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      pantryList.push({ id: doc.id, ...data });
    });
    setPantry(pantryList);
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "Pantry"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          count: docSnap.data().count + 1,
        });
      } else {
        await setDoc(docRef, {
          name: item,
          createdAt: new Date(),
          count: 1,
        });
      }
      console.log("Document written with ID: ", docRef.id);
      updatePantry();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "Pantry"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newCount = docSnap.data().count - 1;
        if (newCount > 0) {
          await updateDoc(docRef, {
            count: newCount,
          });
        } else {
          await deleteDoc(docRef);
        }
        console.log("Document updated/deleted with ID: ", docRef.id);
        updatePantry();
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add
      </Button>
      <Box border={"1px solid #333"}>
        <Box width="800px" height="100px" bgcolor="#ADD8E6">
          <Typography variant={"h2"} textAlign={"center"} color={"#333"}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
          {pantry.map((item) => (
            <Box
              key={item.id}
              width="100%"
              minHeight="150px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"#f0f0f0"}
              paddingX={5}
            >
              <Typography variant={"h3"} textAlign={"center"} color={"#333"}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
              <Typography variant={"h4"} textAlign={"center"} color={"#333"}>
               Quantity {item.count}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(item.id)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
