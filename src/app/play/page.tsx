'use client' 

import styles from './page.module.scss'

import { TextBox, InputPrefix, InputSeparator } from "@progress/kendo-react-inputs"
import { Icon } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons"; 
import { database } from "../firebase/config";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from 'react';

import content from '../quizzes/test.json'

export default function Play() {

    const [username, setUsername] = useState("");
    const [UUID, setUUID] = useState(self.crypto.randomUUID());
    const [playerReady, setPlayerReady] = useState(false);
    const [GMReady, setGMReady] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);


    function handleChange(event) {
        setDisabled(false);
        setUsername(event.target.value.toUpperCase());
    }
    
    //TO-DO: Update "gameID" to be randomly generated value representing a single game 
    function handleSubmit() {
       setUUID(self.crypto.randomUUID());
       set(ref(database, "gameId/" + 'players/' + UUID), {
            username: username,
        });
    }

    useEffect(() => {
        const query = ref(database, "gameId/" + 'players/' + UUID);
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (snapshot.exists()) {
             setPlayerReady(true)
            }});
          }
      )

      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/gmReady/gmReady');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (data === true) {
             setGMReady(true)
            }});
          }
      )

      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/currentQuestion/currentQuestion');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();
            setCurrentQuestion(data)
          
            });
          }
      )

  return (
    <main>
        <header>Important: if you refresh the page, you will have to rejoin the quiz and lose any points!</header>
        { !playerReady && 
            <section> 
                <h1>Start Playing</h1>
                <p>Enter Your Initials:</p>
                <TextBox
                    className={styles.textbox}
                    value={username}
                    onChange={handleChange}
                    placeholder="ABC"
                    maxLength={3} 
                    minLength={1}
                    prefix={() => (
                    <>
                        <InputPrefix>
                        <Icon name="arrow-60-right" />
                        </InputPrefix>
                        <InputSeparator />
                    </>
                    )}/>

                <Button 
                    onClick={handleSubmit}
                    disabled={disabled}
                    >
                        Let's Play
                </Button>
            </section>
        }

        { playerReady && !GMReady && 
            <>
                <h1>Game Loading...</h1>
            </>
        }
      
        { playerReady && GMReady &&
            <>
                <h1>Q: {content.questions[currentQuestion].question}</h1>
                {
                content.questions[currentQuestion].options.map( option => (
                    <Button>{option}</Button>
                ))
                }
            </>
        }
    </main>
  )
}

