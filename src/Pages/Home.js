import React, { Component } from "react"
import * as Tone from 'tone'

import { animate } from "../Components/Animation"
import Navbar from "../Components/Navigation"
import Taskbar from "../Components/Taskbar"
import InfoLeft from "../Components/InfoLeft"
import InfoRight from "../Components/InfoRight"

import "./Home.css"

class Home extends Component {

  state = {
    currentAlgorithm : "",
    isPlaying : false,
    isSorted : false,
    
    maxBars : 20,
    maxHeight : 30,
    transitionDelay : 50,
    
    colors : [],
    heights : [],

    audioControlToggle : false,
    audioNotes : ["C", "D", "E", "F", "G", "A", "B"],
    audioNoteCombinations : [],
    audioNoteCombinationStart : 0,
    volume : 20,
    
    currentTune : "AMSynth",
    tune : new Tone.AMSynth().toDestination(),
    currentSpeed : "Medium",
    speedCounter : 1,
    tuneCounter : 0,
    transitionCounter : 1,
  }

  constructor(props) {
    super(props)
    this.keypressListener = this.keypressListener.bind(this)
    
    this.comparisons = 0
    this.startTime = Date.now()
    this.pastTime = 0

    this.speedOptions = ["Slow", "Medium", "Fast"]
    this.tuneOptions = ["AMSynth", "FMSynth", "M1Synth", "M2Synth"]
    this.transitionOptions = [200, 50, 1]
  }

  keypressListener(event) {
    if (event.keyCode === 32) {
      this.playClick()
    } 
    if (event.keyCode === 82) {
      this.restartClick()
    }
  }

  componentDidMount() {
    this.getRandomHeights()
    //this.setCurrentAlgorithm("quick")
    this.fillAudioNotes()
    this.fillColors()
    this.updateVolume()
    document.addEventListener("keydown", this.keypressListener, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.keypressListener, false);
  }

  getTime = () => {
    return Math.abs(this.startTime - Date.now())/1000
  }

  fillColors = () => {
    let localColors = []
    for (let i = 0; i <= this.state.maxBars*2; i++) {
      localColors.push("#CC20A5")
    }
    this.setState({
      colors : localColors,
      tempColors : localColors
    })
  }

  fillAudioNotes = () => {
    let notes = []
    let total = 0

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 7; j++) {
        notes.push(this.state.audioNotes[j] + i.toString())
        total ++
      }
    }
    
    this.setState({
      audioNoteCombinations : notes,
      audioNoteCombinationStart : (total / 2) + this.state.maxBars
    })
  }

  incrementSpeed = () => {
    const prevCount =  this.state.speedCounter 
    const prevDelay = this.state.transitionCounter
    let newCount = prevCount
    let newDelay = prevDelay
    if (prevDelay + 1 < 3) {
      newCount = prevCount + 1
      newDelay = prevDelay + 1
      this.setState({
        speedCounter : newCount,
        currentSpeed : this.speedOptions[newCount],
        transitionCounter : newDelay,
        transitionDelay :  this.transitionOptions[newDelay]
      })
    }
  }

  decrementSpeed = () => {
    const prevCount = this.state.speedCounter 
    const prevDelay = this.state.transitionCounter
    let newCount = prevCount
    let newDelay = prevDelay
    if (prevCount - 1 >= 0) {
      newCount = prevCount - 1
      newDelay = prevDelay - 1
      this.setState({
        speedCounter : newCount,
        currentSpeed : this.speedOptions[newCount],
        transitionCounter : newDelay,
        transitionDelay :  this.transitionOptions[newDelay]
      })
    }
  }

  incrementTune = () => {
    this.state.tune.triggerRelease()

    const prevCount =  this.state.tuneCounter
    let newCount = prevCount;
    if (prevCount + 1 < 4) {
      newCount = prevCount + 1
    }
    let newTune = this.tuneOptions[Math.abs(newCount)]
    let tempTune = new Tone.AMSynth().toDestination()
    tempTune = this.updateTune(newTune.toLowerCase(), tempTune)

    this.setState({
      tuneCounter : newCount,
      currentTune : newTune,
      tune : tempTune
    })
  }

  decrementTune = () => {
    this.state.tune.triggerRelease()

    const prevCount = this.state.tuneCounter
    let newCount = prevCount;
    if (prevCount - 1 >= 0) {
      newCount = prevCount - 1
    }
    let tempTune = new Tone.AMSynth().toDestination()
    let newTune = this.tuneOptions[Math.abs(newCount)]
    tempTune = this.updateTune(newTune.toLowerCase(), tempTune)
    
    this.setState({
      tuneCounter : newCount,
      currentTune : newTune,
      tune : tempTune
    })
  }

  updateTune = (newTune, tempTune) => {
    if (newTune === "AMSynth".toLowerCase()) {
      tempTune = new Tone.AMSynth().toDestination()
    } else if (newTune === "FMSynth".toLowerCase()) {
      tempTune = new Tone.FMSynth().toDestination()
    } else if (newTune === "M1Synth".toLowerCase()) {
      tempTune = new Tone.MonoSynth().toDestination()
    } else if (newTune === "M2Synth".toLowerCase()) {
      tempTune = new Tone.MembraneSynth().toDestination()
    }

    if (this.state.volume === '-20') {
      tempTune.volume.value = -1000
    } else {
      tempTune.volume.value = this.state.volume
    }
    return tempTune
  }

  getRandomHeights = () => {
    let tempHeights = []
    for (let i = 0; i <= this.state.maxBars*2; i ++) {
      tempHeights.push(parseInt((Math.random() * this.state.maxHeight) + 1))
    }
    this.setState({
      heights : tempHeights
    })
  }

  setCurrentAlgorithm = async (name) => {
    this.setState({
      currentAlgorithm : name
    })
    this.restartClick()
  }

  playAllBars = async () => {
    this.pastTime = Math.abs((Date.now() - this.startTime) / 1000)
    let delay = 2000
    for (let i = 0; i < this.state.heights.length; i++) {
      await this.playSound(i)
      await this.updateColors(i, "#FFFFFF", delay)
    }
    this.state.tune.triggerRelease()
  }

  playClick = async () => {
    this.startTime = Date.now()
    let temp = this.state.isPlaying
    await this.setState({
      isPlaying : !temp
    })

    if (!temp && !this.state.isSorted) {
      let tempHeights = this.state.heights

      if (this.state.currentAlgorithm === "quick") {
        await this.quicksort(tempHeights, 0, tempHeights.length - 1)
      }
      else if (this.state.currentAlgorithm === "selection") {
        await this.selectionsort(tempHeights)
      }
      
      if (this.state.isPlaying === true) this.playAllBars()
      
      this.setState({
        isPlaying : false,
        isSorted : true
      })
    }

    this.state.tune.triggerRelease()
    
  }

  restartClick = async () => {
    this.comparisons = 0
    this.pastTime = 0
    this.state.tune.triggerRelease()
    this.setState({
      isPlaying : false,
      isSorted : false
    })
    this.getRandomHeights()
  }

  volumeHover = async () => {
    let elem = document.getElementById("volume")
    let toggle = this.state.audioControlToggle
    elem.style.opacity = 100
    
    this.setState({
      audioControlToggle : !toggle
    })
  }

  volumeNotHover = async () => {
    let elem = document.getElementById("volume")
    let toggle = this.state.audioControlToggle
    elem.style.opacity = 0
    
    this.setState({
      audioControlToggle : !toggle
    })
  }

  updateVolume = async () => {
    this.state.tune.triggerRelease()
    let tempTune = ""
    let temp = new Tone.AMSynth().toDestination()
    let localVolume = document.getElementById("volume").value - 30

    if (this.state.currentTune === "AMSynth") {
      temp = new Tone.AMSynth().toDestination()
    } else if (this.state.currentTune === "FMSynth") {
      temp = new Tone.FMSynth().toDestination()
    } else if (this.state.currentTune === "M1Synth") {
      temp = new Tone.MonoSynth().toDestination()
    } else if (this.state.currentTune === "M2Synth") {
      tempTune = new Tone.MembraneSynth().toDestination()
    }

    if (localVolume === -30) {
      temp.volume.value = -500
    } else {
      temp.volume.value = localVolume
    }
    
    this.setState({
      tune : temp,
      volume : localVolume
    })
  }

  playSound = async (distance) => {
    await new Promise(r => setTimeout(r, 10));
    this.state.tune.triggerRelease()
    let note = this.state.audioNoteCombinations[this.state.audioNoteCombinationStart - distance]
    
    this.state.tune.triggerAttackRelease(note, 10);
  }

  updateColors = async (index, newColor, delay) => {
    if (!delay) delay = 0
    let tempColors = this.state.colors
    tempColors[index] = newColor
    this.setState({
      colors : tempColors
    })
    
    await new Promise(r => setTimeout(r, this.state.transitionDelay));
    
    tempColors[index] = "#CC20A5"
    this.setState({
      colors : tempColors
    })
  }

  updateHeight = async (data) => {
    this.setState({
      heights : data
    })
    await new Promise(r => setTimeout(r, this.state.transitionDelay));
  }

  // ALGORITHMS HERE, WILL BE MIGRATED TO INDIVIDUAL COMPONENTS SOON
  
  swap = async (data, indexOne, indexTwo) => {
    if (!this.state.isPlaying) return
    let temp = data[indexOne]
    data[indexOne] = data[indexTwo]
    data[indexTwo] = temp
  }

  quicksort = async (data, left, right) => {
    if (!this.state.isPlaying) return
    if (left < right) {
      this.comparisons += 1
      let index = await this.partition(data, left, right)
      await this.quicksort(data, left, index - 1)
      await this.quicksort(data, index + 1, right)
    }
  }

  partition = async (data, left, right) => {
    let pivot = data[right]
    let i = left - 1

    for (let j = left; j < right; j++) {
      if (!this.state.isPlaying) return
      await this.updateColors(j, "#FFFFFF")
      await this.playSound(data[j])
      if (data[j] < pivot) {
        this.comparisons += 1
        i++
        await this.updateColors(i, "#00FF00")
        await this.updateColors(j, "#FF0000")
        this.swap(data, j, i)
        await this.updateHeight(data)
        
      }
    }
    this.swap(data, i+1, right)
    await this.updateHeight(data)

    return i + 1
  }

  selectionsort = async (data) => {
    let sorted = []
    let unsorted = data
    let minIndex = 0
    
    while (unsorted.length > 0) {
      minIndex = 0
      if (unsorted[minIndex + 1] != null && unsorted[minIndex] == unsorted[minIndex + 1]) {
        this.comparisons += 1
      } else {
        for (let i = 0; i < data.length; i++) {
          if (!this.state.isPlaying) return
          await this.playSound(data[i])
          await this.updateColors(i, "#FFFFFF")
          if (unsorted[i] <= unsorted[minIndex]) {
            this.comparisons += 1
            minIndex = i
          }
        }
      }
      
      sorted.push(unsorted.splice(minIndex, 1))
      data = sorted.concat(unsorted)

      await this.updateHeight(data)
    }
  }

  render() {

    return (
      <React.Fragment>

        <div id="header">
          <div id="titleContainer">
            <p class="title" id="titleA">Sorting</p>
            <p class="title" id="titleB">Visualizer</p>  
          </div>
          <Navbar setCurrentAlgorithm={this.setCurrentAlgorithm} />
        </div>
   
        <div id="content">
          
          <InfoLeft alg={this.state.currentAlgorithm}/>
          
          <div id="animationWrapper">
            <div id="animation">
              {animate(this.state.maxBars, this.state.heights, this.state.colors)}
            </div>
            
            <Taskbar restartClick={this.restartClick} playClick={this.playClick} volumeHover={this.volumeHover} volumeNotHover={this.volumeNotHover} updateVolume={this.updateVolume} openModal={this.openModal} />
          </div>

          <InfoRight alg={this.state.currentAlgorithm} comparisons={this.comparisons} timeElapsed={this.state.isPlaying ? this.getTime() : this.pastTime} currentSpeed={this.state.currentSpeed} currentTune={this.state.currentTune} incrementSpeed={this.incrementSpeed} decrementSpeed={this.decrementSpeed} incrementTune={this.incrementTune} decrementTune={this.decrementTune} />

          </div>
        
      </React.Fragment>
    );
  }
}

export default Home;