import { ichimokuCloud } from 'indicatorts';


const highs = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,5]

const lows = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,5]
const closings = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,50,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,17,19,29,30,32,40,50,45,46,47,48,49,5]
const defaultConfig = { short: 9, medium: 26, long: 52, close: 26 };
const { tenkan, kijub, ssa, ssb, lesadingSpan, laggingSpan, leadingSpan } = ichimokuCloud(highs, lows, closings, defaultConfig);


console.log(leadingSpan)