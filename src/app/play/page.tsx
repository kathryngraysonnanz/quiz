'use client' 

import styles from './page.module.scss'

import { TextBox, InputPrefix, InputSeparator, RadioGroup } from "@progress/kendo-react-inputs"
import { Icon } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons"; 
import { Chart, ChartCategoryAxis, ChartCategoryAxisItem, ChartCategoryAxisTitle, ChartSeries, ChartSeriesItem, ChartValueAxis, ChartValueAxisItem } from "@progress/kendo-react-charts";
import { database } from "../firebase/config";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from 'react';
import "hammerjs";

import content from '../quizzes/test.json'

export default function Play() {

    const [username, setUsername] = useState("");
    const [UUID, setUUID] = useState(self.crypto.randomUUID());
    const [playerReady, setPlayerReady] = useState(false);
    const [GMReady, setGMReady] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([0,0,0,0]);
    const [answers, setAnswers] = useState(["","","",""]);

    // Updates username when user types, changes to uppercase, and requires at least one letter to unlock button 
    function handleChange(event) {
        setDisabled(false);
        setUsername(event.target.value.toUpperCase());
    }
    
    //TO-DO: Update "gameID" to be randomly generated value representing a single game 
    //Logs username in Firebase 
    function handleSubmit() {
       set(ref(database, "gameId/" + 'players/' + UUID), {
            username: username,
        });
    }

    //Logs current answer in Firebase when user clicks 
    const logAnswer = (e, currentQuestion) => {
        set(ref(database, "gameId/" + 'players/' + UUID + "/" + currentQuestion), {
            answer: e.value,
        });
        console.log(currentQuestion)
    };

    //Watches for when player is ready
    useEffect(() => {
        const query = ref(database, "gameId/" + 'players/' + UUID);
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (snapshot.exists()) {
             setPlayerReady(true)
            }});
          }
      )

      //Watches for when GM is ready 
      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/gmReady/gmReady');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          if (data === true) {
             setGMReady(true)
            }});
          }
      )

      //Watches for when GM shows results to players 
      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/currentQuestion/showResults');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();
          setShowResults(data);
            });
        }
    )

    //Watches to see when GM changes questions 
      useEffect(() => {
        const query = ref(database, "gameId/" + 'GM/currentQuestion/questionNumber');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();
            setCurrentQuestion(data)
            });
          }
      )

      //Watches and counts user responses in real time 
      let responses = []
      let counts = {}; 

      useEffect(() => {
        const query = ref(database, "gameId/" + 'players');
        return onValue(query, (snapshot) => {
          const data = snapshot.val();

          // Resets responses array 
           responses = []

            //Collects all responses into an array 
            for (const property in data) {
                if (Object.hasOwn(data[property], currentQuestion)) {
                 responses.push(data[property][currentQuestion].answer)
               }
            }

            //Counts the number of each different response in the array 
            counts = responses.reduce((count, item) => (count[item] = count[item] + 1 || 1, count), {});

           console.log("results", results, "counts", Object.values(counts))

           if (JSON.stringify(results) !== JSON.stringify(Object.values(counts))){
            setResults(Object.values(counts))
           }

           if (JSON.stringify(answers) !== JSON.stringify(Object.keys(counts))){
            setAnswers(Object.keys(counts))
           }

        });
      })

      console.log("responses", responses, "counts", counts)

      //Maps possible answers for each question into label/value format for UI 
      let options = content.questions[currentQuestion].options.map( option => ({
        label: option, value: option 
      }))
      

  return (
    <main>
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
      
        { GMReady &&
            <>
                <h1>Q: {content.questions[currentQuestion].question}</h1>

                <RadioGroup onChange={e => { logAnswer(e, currentQuestion) }} data={options}/>

             
                <>
                    <h2>A: {content.questions[currentQuestion].answer}</h2>
                    <Chart>
                        ChartTitle text="Results" />
                        <ChartCategoryAxis>
                            <ChartCategoryAxisItem categories={answers}>
                                <ChartCategoryAxisTitle text="Options" />
                            </ChartCategoryAxisItem>
                        </ChartCategoryAxis>
                        <ChartValueAxis>
                            <ChartValueAxisItem title={{ text: "Responses" }} min={0} />
                        </ChartValueAxis>
                        <ChartSeries>
                            <ChartSeriesItem type="bar" data={results} />
                        </ChartSeries>
                    </Chart>
                </>
                
            </>
        }
    </main>
  )
}

