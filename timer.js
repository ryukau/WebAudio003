const oscillatorType = [
    "sine",
    "square",
    "sawtooth",
    "triangle"
    ];

const MAX_CHORD = 16;
const MAX_HARMONICS = 32;

const BASE_DURATION = 0.090;
const DURATION_MULTIPLIER = 3;

var ctxAudio = new AudioContext();

var gainNode = ctxAudio.createGain();
gainNode.connect(ctxAudio.destination);
var gain = 1;

// chord osc
var oscNodeArray = [];

var oscType = "sine";
var oscDetune = 0;
var oscFrequency = 440;

// timer event
var timerPlayChord;

initUI();

function playChord() {
    stopChord();

    var nChord = randomUInt1(MAX_CHORD);

    var detune = oscDetune + 175 * randomInt(-12, 12);
    //var oscType = randomOscType();
    oscNodeArray.length = 0;
    for (var i = 0; i < nChord; ++i) {
        oscNodeArray.push(ctxAudio.createOscillator());

        oscNodeArray[i].connect(gainNode);
        oscNodeArray[i].type = oscType;
        oscNodeArray[i].detune.value = detune;
        oscNodeArray[i].frequency.value = modFreq(oscFrequency * randomUInt1(MAX_HARMONICS), oscFrequency);
        oscNodeArray[i].start(ctxAudio.currentTime);
    }

    ctxAudio.resume();

    var duration = BASE_DURATION * Math.pow(2, randomUInt(DURATION_MULTIPLIER));
    // var duration = 0.020 + 0.2 * Math.random();
    var curTime = ctxAudio.currentTime === undefined ? 0 : ctxAudio.currentTime;
    gainNode.gain.setValueAtTime(gain / nChord, curTime);

    //gainNode.gain.linearRampToValueAtTime(0, curTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(1e-2, curTime + duration); // valueに0を設定できない
    //gainNode.gain.setTargetAtTime(0, curTime, 0.1);

    timerPlayChord = setTimeout(playChord, 1000 * duration);
}

function stopChord() {
    for (var i = 0; i < oscNodeArray.length; ++i) {
        oscNodeArray[i].stop(ctxAudio.currentTime);
        oscNodeArray[i].disconnect();
    }

    clearTimeout(timerPlayChord);
}

// Util //
function clamp(val, min, max) {
    return isNaN(val) ? 0 : Math.max(min, Math.min(val, max));
}

function modFreq(a, b) {
    // 別の方法
    // var n = Math.floor(Math.log2(b/a));
    // b = Math.pow(2, n);

    while ((4 * b) <= a) {
        a /= 2;
    }
    return a;
}

function randomInt(min, max) {
    return parseInt(min + Math.random() * (max - min));
}

function randomUInt(max) {
    return Math.floor(Math.random() * max);
}

function randomUInt1(max) {
    return Math.floor(Math.random() * max) + 1;
}

function randomOscType() {
    return oscillatorType[randomUInt(oscillatorType.length)];
}


//
// UI
//

function removeAllChild(elem)
{
    while(elem.firstChild)
        elem.removeChild(elem.firstChild);
}

function initUI() {
    var selectOscType = document.getElementById("selectOscType");
    removeAllChild(selectOscType);

    for (var i = 0; i < oscillatorType.length; ++i) {
        var o = selectOscType.appendChild(document.createElement("option"));
        o.textContent = oscillatorType[i];
    }

    oscFrequency = document.getElementById("numberFrequency").value;
}

function onClickButtonKill() {
    stopChord();
}

// Simple //
function onMouseDownButtonPlay() {
    playChord();
}

function onMouseUpButtonPlay() {
    stopChord();
}

function onInputRangeGain(value, elem) {
    gain = clamp(value, elem.min, elem.max);
    elem.value = gain;

    if (gainNode != null) {
        gainNode.gain.value = gain / oscNodeArray.length;
    }
}

function onChangeSelectOscType(value) {
    oscType = oscillatorType[value];
}

function onInputNumberDetune(value, elem) {
    oscDetune = clamp(value, elem.min, elem.max);
    elem.value = oscDetune;
}

function onInputNumberFrequency(value, elem) {
    oscFrequency = clamp(value, elem.min, elem.max);
    elem.value = oscFrequency;
}