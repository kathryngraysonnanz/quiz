'use client'

import styles from './page.module.css'
import {Button} from "@progress/kendo-react-buttons"
import { database } from "./firebase/config";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from 'react';

export default function Home() {

  const [name, setName] = useState(0);

  useEffect(() => {
    const query = ref(database, 'users/username');
    return onValue(query, (snapshot) => {
      const data = snapshot.val();

      if (snapshot.exists()) {
          setName(data);
        }});
      }
  )

  function getRandomInt() {
    return Math.floor(Math.random() * 20);
  }

  function handleClick() {
    console.log(getRandomInt())

    set(ref(database, 'users'), {
      username: getRandomInt(),
    });
  }


  return (
    <main>
      <h1>Demo</h1>
      <Button onClick={handleClick}>Test</Button>
      <p>Current: {name}</p>
    </main>
  )
}
