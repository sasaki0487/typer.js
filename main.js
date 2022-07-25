#!/usr/bin/env node
/*
	Terminal Kit

	Copyright (c) 2009 - 2021 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;

const termkit = require( 'terminal-kit' )
const term = termkit.terminal
const rw = require('random-words')

var state
var wordCount
var errorCount
var charCount
var errorCharCount
var x
var interv
var paragraph = ""
var startTime,currentTime
var sbuf = new termkit.ScreenBuffer( {
    dst: term , width: 30 , height: 10 , x: 3 , y: 4
})
var tbuf = new termkit.TextBuffer( { dst: sbuf, lineWrapWidth: 30, wrap: true  }  )

function startTyping(){

    wordCount = 0
    errorCharCount = 0
    charCount = 0
    x = 0
    startTime = Date.now()
    genString()
    tbuf.setText(paragraph)
    tbuf.moveTo(0,0)
    tbuf.draw()
    sbuf.draw()
    tbuf.drawCursor()
    sbuf.drawCursor()


    interv = setInterval(() => {
        calculateSpeed()
        printSpeed()
    },40)
}

function calculateSpeed(){
    currentTime = Date.now()
}

function printSpeed(){
    var printStr = (charCount / ((currentTime - startTime)/60000)).toFixed(2) + ' Character Per Minute'
    printStr += `\n  Correct: ${charCount} Error: ${errorCharCount}`
    term.moveTo(3,0, printStr)
    draw()
}

function draw(){
    tbuf.draw()
    sbuf.draw()
    tbuf.drawCursor()
    sbuf.drawCursor()
}

function genString(){
    paragraph = rw({exactly: 40, join: ' '})
    paragraph += ' .'
}

function init(){
    state = 0
    term.fullscreen()
    term('Press Enter to start\nTime starts after Enter pressed, \nends after the last \'.\' character is correctly hit')

    term.grabInput()

    term.on('key',(name,matches,type) =>{
        if(type.isCharacter && state == 1){
            var str = tbuf.getText()
            if(str[x] == name){
                tbuf.setAttrAt({color:'green'},x%30,Math.floor(x/30))
                tbuf.moveForward()
                x += 1
                if(name != 'SPACE')
                    charCount += 1
            }
            else{
                tbuf.setAttrAt({color:'red'},x%30,Math.floor(x/30))
                tbuf.moveForward()
                x += 1
                errorCharCount += 1
            }
            if (str[x-1] == '.' && name == '.'){
                calculateSpeed()
                printSpeed()
                state = 0
                clearInterval(interv)
            }
            if(x % 30 == 0){
                tbuf.moveForward()
            }
            draw()
        }

        switch(name){
            case 'ENTER' :
                if(state == 0){
                    state = 1
                    term.clear()
                    startTyping()
                }
            break

            case 'CTRL_C' :
                term.clear()
                term.grabInput(false)
                setTimeout(() => { process.exit(); },100)
            break

            case 'BACKSPACE' :
                if(state == 1){
                    if(x % 30 == 0){
                        tbuf.moveBackward()
                    }
                    x = x - 1
                    tbuf.setAttrAt({color:'white'},x%30,Math.floor(x/30))
                    tbuf.moveBackward()
                }
                draw()
            break
        }

    })

}

init()

