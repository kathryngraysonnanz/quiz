'use client' 

import { Button } from "@progress/kendo-react-buttons"; 
import { database } from "../firebase/config";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect, useRef } from 'react';

import content from '../quizzes/test.json'

export default function GM() {

    const [username, setUsername] = useState("");
    const [GMReady, setGMReady] = useState(false);
    const [timer, setTimer] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0)

    const id = useRef(null);
    const clear = () => {
        window.clearInterval(id.current);
      };

    useEffect(() => {
        id.current = window.setInterval(() => {
          setTimer((time) => time + 1);
        }, 1000);
        return () => clear();
      }, []);

    useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/gmReady/gmReady');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (snapshot.exists()) {
             if (data === true) {
                setGMReady(true)
             } else {
                setGMReady(false)
             }
            }});
          }
      )

      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/currentQuestion/currentQuestion');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (snapshot.exists()) {
             setCurrentQuestion(data)
            }});
          }
      )

    function handleSubmit() {
        set(ref(database, "gameId/" + 'GM/gmReady'), {
            gmReady: !GMReady,
        });
    }

    function incrementSeconds() {
        let current = timer; 
        setSeconds (current+=1);
    }

    function nextQuestion() {
        set(ref(database, "gameId/" + 'GM/currentQuestion'), {
            currentQuestion: currentQuestion+1,
        });
        setTimer(0)
    }

    let totalQuestions = content.questions.length; 


  return (
    <main>
    
        { !GMReady && 
            <>
                <h1>Hello, Game Master!</h1>
                <h2>Ready to run the quiz?</h2>
                <p>The current loaded quiz is <b>{content.name}</b>.</p>
                <ol>
                    <li>Ensure the correct quiz has been loaded into the 'quizzes' folder and is being imported.</li>
                    <li>Give players some time to join.</li>
                    <li>Click the button below to begin the quiz for everyone.</li>
                    <li>Have fun!</li>
                </ol>

                <Button onClick={handleSubmit}>Start the Game!</Button>
            </>
        }

        { GMReady && 
            <>
                <h1>Question {currentQuestion+1} of {totalQuestions}:</h1>
                <h2>{content.questions[currentQuestion].question}</h2>
                <p>This question has been visible to players for {timer} seconds</p>

                <p>TO-DO: show response %s</p>
                
                <Button onClick={nextQuestion}>Next Question</Button>
            </>
        }

    </main>
  )
}

