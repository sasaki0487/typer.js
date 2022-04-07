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
var tick
var wordCount
var errorCount
var x
var paragraph = ""
var sbuf = new termkit.ScreenBuffer( {
    dst: term , width: 30 , height: 10 , x: 3 , y: 3
})
var tbuf = new termkit.TextBuffer( { dst: sbuf, lineWrapWidth: 30, wrap: true  }  )

function startTyping(){
    term.clear()

    wordCount = 0
    errorCount = 0
    tick = 0
    x = 0
    //tbuf.setText('this is a test string for display.')
    genString()
    tbuf.setText(paragraph)
    tbuf.draw()
    sbuf.draw()
    tbuf.drawCursor()
    sbuf.drawCursor()


    setTimeout(() => {
        calculateSpeed()
        printSpeed()
    },1000)
}

function calculateSpeed(){

}

function printSpeed(){

}

function genString(){
    paragraph = rw({exactly: 40, join: ' '})
}

function init(){
    state = 0
    term.fullscreen()
    term('Press Enter to start\n')

    term.grabInput()

    term.on('key',(name,matches,type) =>{
        if(type.isCharacter && state == 1){
            var str = tbuf.getText()
            if(str[x] == name){
                tbuf.setAttrAt({color:'green'},x%30,Math.floor(x/30))
                tbuf.moveForward()
                x += 1
            }
            else{
                tbuf.setAttrAt({color:'red'},x%30,Math.floor(x/30))
                tbuf.moveForward()
                x += 1
            }
            if(x % 30 == 0){
                tbuf.moveForward()
            }

            tbuf.draw()
            sbuf.draw()
            tbuf.drawCursor()
            sbuf.drawCursor()
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
                    x = x - 1
                    tbuf.setAttrAt({color:'white'},x%30,Math.floor(x/30))
                    tbuf.moveBackward()
                    if(x % 30 == 0){
                        tbuf.moveBackward()
                    }
                }
                tbuf.draw()
                sbuf.draw()
                tbuf.drawCursor()
                sbuf.drawCursor()
            break
        }

    })

}

init()

