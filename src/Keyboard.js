import { useRef, useEffect, useState, memo } from "react";

import "./Keyboard.css";

const a = ["á", "à", "ã", "â"]
const e = ["é", "ê"]
const i = ["í"]
const o = ["ó", "õ", "ô"]
const u = ["ú"]
const c = ["ç"] 

const Keyboard = function ({input, cursorPosition, setCursorPosition}) {
    const [keyboard, setKeyboard] = useState(true)
    const [activeShift, setActiveShift] = useState(false)
    const [specialLetters, setSpecialLetters] = useState([])

    // Disable pop up windows from right click (prevents infinite pressing bug)
    useEffect(() => {
        document.oncontextmenu=RightMouseDown
        document.onmousedown = mouseDown

        function mouseDown(e) {
        if(e.which==3) return			 
        }

        function RightMouseDown(){
                  return false
        }
    }, [])
    
    // Clear special letters array when input element changes
    useEffect(() => {
        setSpecialLetters([])
    }, [input])

	function insert(keyEvent) {
        keyEvent.preventDefault()

        if(!input) return 

        const key = keyEvent.target.id

        switch(key) {
            case "numeric":
                setActiveShift(false)
                setSpecialLetters([])
                return setKeyboard(false)

            case "abc":
                setActiveShift(false)
                setSpecialLetters([])
                return setKeyboard(true)

            case "delete":
                setSpecialLetters([])

                if(cursorPosition < 1) return 

                // cannot be called i, because it breaks the 'case "i" || "I"'
                let inp = input.current.value
                const start = input.current.selectionStart

                input.current.value = inp.slice(0, start - 1) + inp.slice(start)
                input.current.setSelectionRange(start - 1, start - 1)
                input.current.focus()

                // On repetitive delete (always clicked), cursor position needs to be updated this way
                cursorPosition--
                setCursorPosition(cursorPosition)
                return

            case "space":
                setSpecialLetters([])
                insertNormalKey(" ")
                return

            case "change-case": 
                setActiveShift((shift) => !shift)
                return
            
            case "a" || "A":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? a.map(key => key.toUpperCase()) : a)

            case "e" || "E":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? e.map(key => key.toUpperCase()) : e)

            case "i" || "I":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? i.map(key => key.toUpperCase()) : i)
                
            case "o" || "O":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? o.map(key => key.toUpperCase()) : o)

            case "u" || "U":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? u.map(key => key.toUpperCase()) : u)
                
            case "c" || "C":
                insertNormalKey(key)
                return setSpecialLetters(() => activeShift ? c.map(key => key.toUpperCase()) : c)
        }
        
        setSpecialLetters([])
        insertNormalKey(key)

        function insertNormalKey(key)  {
            const i = input.current.value 
            const start = input.current.selectionStart
            console.log(start)

            // Uppercase key if shift is active
            key = activeShift ? key.toUpperCase() : key

            // Cut input/textarea value before and after cursor position
            // Paste the first half
            // Insert the new input key (target.event.id) 
            // Paste the second half of input
            input.current.value = i.slice(0, start) + key + i.slice(start)

            // Needs to move 3 more positions than a normal key stroke, because it has 4 letters
            if(key === ".com") return setCursorPosition(() => start + 3)

            // Sets new cursor position 
            input.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1)
            input.current.focus()

            setCursorPosition(() => start + 1)
        }
	}

    function insertSpecialKey(e) {
        if(!input) return 

        const i = input.current.value 
        input.current.value = i.slice(0, cursorPosition - 1) + e.target.id + i.slice(cursorPosition)

        input.current.setSelectionRange(cursorPosition, cursorPosition)
        input.current.focus()
        setSpecialLetters([])
    }

	return (
		<>
			<div id="keyboard-container" className="display-none" >
				<div id="accent-keyboard">
                    {keyboard ? <Alphabetical insert={(e) => insert(e)} activeShift={activeShift}/> : <Numeric insert={(e) => insert(e)} />}
					<div className="accent-keyboard-modifications">
                        {
                            specialLetters.map(key => {
                                 return <div key={key} className="key" id={key} onClick={insertSpecialKey}>{
                                     activeShift ? key.toUpperCase() : key
                                 }</div>   
                        })
                        }
					</div>
				</div>
			</div>
		</>
	);
};

export default memo(Keyboard);

const Alphabetical = ({ insert, activeShift }) => {
	const keys = [
		["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
		["a", "s", "d", "f", "g", "h", "j", "k", "l"],
		["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
		["123?", "@", "space", ".", ".com"],
	];

    const interval = useRef(null)

	return (
		<div id="keys-layout">
			{keys.map((keyboardRow, index) => {
				return (
					<div key={index} className="keyboard-row">
						{keyboardRow.map((key) => {
                            if(key === "123?") return <div key="numeric" className="key" id="numeric" onClick={(e) => insert(e)} >{key}</div>

                            // id = delete must be in the nested div, because it is the event target element, and id is used to map key actions
                            if(key === "backspace") return <div key={key} className="key" id={key}  onClick={(e) => insert(e)} onTouchStart={(e) => interval.current = setInterval(() => {insert(e)}, 200)} onTouchEnd={() => clearInterval(interval.current)}><div id="delete"></div></div> 

                            // id = change-case must be in the nested div, because it is the event target element, and id is used to map key actions
                            if(key === "shift") return <div key={key} className="key" id={key} onClick={(e) => insert(e)} ><div id="change-case"></div></div> 

                            if(key === "space") return <div key={key} className="key" id={key} onClick={(e) => insert(e)} ><div></div></div> 

							return (
								<div key={key} className="key" id={key} onTouchEnd={(e) => insert(e)}>
									{activeShift ? key.toUpperCase(): key}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};

const Numeric = ({insert}) => {
	const keys = [
		["1", "2", "3", "0", ".", ",", "-", "@"],
		["4", "5", "6", "/", ":", "_", "*", "#"],
		["7", "8", "9", "(", ")", "$", "?", "!"],
		["abc", "space", "backspace"],
	];

	return (
		<div id="numeric-layout">
			{keys.map((keyboardRow, index) => {
				return (
					<div key={index} className="keyboard-row">
						{keyboardRow.map((key) => {
                            if(key === "space") return <div key={key} className="key" id={key} onClick={(e) => insert(e)} ><div></div></div> 

                            // id = delete must be in the nested div, because it is the event target element, and id is used to map key actions
                            if(key === "backspace") return <div key={key} className="key" id={key} onClick={(e) => insert(e)} ><div id="delete"></div></div> 

							return (
								<div key={key} className="key" id={key} onTouchEnd={(e) => insert(e)}>
									{key}
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};
