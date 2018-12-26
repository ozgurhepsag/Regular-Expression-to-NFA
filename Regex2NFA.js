/*
ÖZGÜR HEPSAĞ     2014510043
MEHMET ALP SÜMER 2015510054
ÇAĞDAŞ BİLECEN   2014510015
*/

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var flag;
var hashTable = {}; // Hashtable for represent transition of the all states.
var finalStack = []; // finalstack will be resullt of the CreateNFA function. It will be contain just one object if the NFA is created successfully.

function TestNFA(regex, input){ // WE ASSUME THAT THE USER GIVE HER/HIS INPUT WITH CONCATENATE OPERATOR AS ".". FOR EXAMPLE: "A.B"
    flag = false; // Return variable, if input is convenient for the given regex.
    var postfix = Parse(regex); // Infix to postfix notation of regex.
    hashTable = {}; // Hashtable for represent transition of the all states.
    finalStack = []; // finalstack will be resullt of the CreateNFA function. It will be contain just one object if the NFA is created successfully.

    CreateNFA(postfix, hashTable, finalStack); // Create all the state and making connections of the states to create NFA.
                                               // We have two types of object (information about that is given in this function) in the CreateNFA to build NFA.

    for (let index = 0; index < Object.keys(hashTable).length; index++) { // Determine accept states of the states according to final result object that comes from CreateNFA function.

        hashTable["q" + index].accept = false;

        for (let index2 = 0; index2 < finalStack[0].acceptStates.length; index2++) {

            if(finalStack[0].acceptStates[index2] == "q" + index){
                hashTable["q" + index].accept = true;
            }
        }
    }

    CheckInput(input, hashTable, finalStack[0].initialState, 0); // Recursive function to check input true or false according to given regex.

    console.log(flag);
}

function CheckInput(input, hashTable, currentState, index){ // This function provide us to traverse all the possible states in the NFA,
                                                            // until reach one of the accept states at the end of the output or not.

    if(index == input.length){ // At the end of the input string. Check the current state is accept state or not.

        if(hashTable[currentState].accept == true){ // If current state is accept, then the flag is going to be true.
            flag = true;
        }
        else{
            for (let i = 0; i < hashTable[currentState]["EPSILON"].length; i++) {
                CheckInput(input, hashTable, hashTable[currentState]["EPSILON"][i], index); // If current state is not accept state,
                                                                                            // but we have also other states that we can reach with EPSILON.
            }
        }

    }
    else if(index < input.length){ // Input string is not at the last part, so we need to keep going to traverse all the possible transition, until end of the input string.

        if(hashTable[currentState][input[index]] == undefined){
            for (let i = 0; i < hashTable[currentState]["EPSILON"].length; i++) {
                CheckInput(input, hashTable, hashTable[currentState]["EPSILON"][i], index); // Go to states with EPSILON
            }
        }
        else{
            for (let i = 0; i < hashTable[currentState][input[index]].length; i++) {
                CheckInput(input, hashTable, hashTable[currentState][input[index]][i], index + 1); // Go to states with current operand
            }
        }

    }
}

function CreateNFA(postfix, hashTable, finalStack){

    // We have two kind of object that we keep to create exact NFA.

    /* First - State Object => This object keep state information
        q0: {
            label: 'q0',
            EPSILON: [ 'q1', 'q3' ],
            a: ['q1', 'q4']
            accept: false }
    */

    /* Second - Result Object => This object is created from result of the operators. Each operator has different feature.
            Purpose of this object is to keep initial states and accept states for the next creation stages of the NFA.
            {
            label: 'R8',
            initialState: 'q20',
            acceptStates: [ 'q22', 'q19', 'q16', 'q13', 'q12', 'q7', 'q9' ] }
    */

    var stateCounter = 0; // counter for state label
    var resultCounter = 0; // counter for result
    for (let index = 0; index < postfix.length; index++) { // Each operand and aperation will be handled.
        const element = postfix[index];

        switch(element){

            case "*": // star
                var operand = finalStack.pop();

                if(typeof(operand) == 'string'){ // State creations and connect state each other with proper way, if the operand is [a-z].

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['EPSILON'].push('q' + stateCounter); // a: ['q1']
                    tempState['accept'] = true;

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1[operand] = [];
                    state1[operand].push('q' + stateCounter); // a: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;

                    var state2 = {};
                    state2['label'] = 'q' + stateCounter; //q2
                    stateCounter++;
                    state2['EPSILON'] = [];
                    state2['accept'] = true;
                    state2['EPSILON'].push(state1.label);

                    hashTable[state2.label] = state2;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(tempState.label);
                    result.acceptStates.push(state2.label);

                    finalStack.push(result);
                }
                else if(typeof(operand) == 'object'){ // State creations and connect state each other with proper way, if the operand is Result Object.

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter;
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['EPSILON'].push(operand.initialState);
                    tempState['accept'] = true;

                    hashTable[tempState.label] = tempState;

                    hashTable[operand.initialState].accept = false;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(tempState.label);

                    for (let index = 0; index < operand.acceptStates.length; index++) {
                        const element = operand.acceptStates[index];

                        hashTable[element].EPSILON.push(operand.initialState);
                        result.acceptStates.push(hashTable[element].label);

                    }

                    finalStack.push(result);
                }

            break;
            case "+": // union
                var operand1 = finalStack.pop();
                var operand2 = finalStack.pop();

                if(typeof(operand1) == 'string' && typeof(operand2) == 'string'){ // We have four options for the union operator.
                                                                                  // The two elements taken from the stack could be Result Object or normal operand [a-z]
                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['accept'] = false;

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1[operand1] = [];
                    state1[operand1].push('q' + stateCounter); // a: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;

                    var state2 = {};
                    state2['label'] = 'q' + stateCounter; //q2
                    stateCounter++;
                    state2['EPSILON'] = [];
                    state2['accept'] = true;

                    hashTable[state2.label] = state2;

                    var state3 = {};
                    state3['label'] = 'q' + stateCounter; //q3
                    stateCounter++;
                    state3['EPSILON'] = [];
                    state3[operand2] = [];
                    state3[operand2].push('q' + stateCounter); // a: ['q4']
                    state3['accept'] = false;

                    hashTable[state3.label] = state3;

                    var state4 = {};
                    state4['label'] = 'q' + stateCounter; //q4
                    stateCounter++;
                    state4['EPSILON'] = [];
                    state4['accept'] = true;

                    hashTable[state4.label] = state4;

                    tempState['EPSILON'].push(state1.label);
                    tempState['EPSILON'].push(state3.label); // a: ['q1', 'q3']

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(state2.label);
                    result.acceptStates.push(state4.label);

                    finalStack.push(result);

                }
                else if(typeof(operand1) == 'object' && typeof(operand2) == 'string'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['accept'] = false;
                    tempState.EPSILON.push(operand1.initialState);

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1[operand2] = [];
                    state1[operand2].push('q' + stateCounter); // a: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;
                    tempState['EPSILON'].push(state1.label);

                    var state2 = {};
                    state2['label'] = 'q' + stateCounter; //q2
                    stateCounter++;
                    state2['EPSILON'] = [];
                    state2['accept'] = true;

                    hashTable[state2.label] = state2;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(state2.label);

                    for (let index = 0; index < operand1.acceptStates.length; index++) {
                        const element = operand1.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    finalStack.push(result);
                }
                else if(typeof(operand1) == 'string' && typeof(operand2) == 'object'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['accept'] = false;
                    tempState.EPSILON.push(operand2.initialState);

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1[operand1] = [];
                    state1[operand1].push('q' + stateCounter); // a: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;
                    tempState['EPSILON'].push(state1.label);

                    var state2 = {};
                    state2['label'] = 'q' + stateCounter; //q2
                    stateCounter++;
                    state2['EPSILON'] = [];
                    state2['accept'] = true;

                    hashTable[state2.label] = state2;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(state2.label)

                    for (let index = 0; index < operand2.acceptStates.length; index++) {
                        const element = operand2.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    finalStack.push(result);
                }
                else if(typeof(operand1) == 'object' && typeof(operand2) == 'object'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState['accept'] = false;
                    tempState.EPSILON.push(operand1.initialState);
                    tempState.EPSILON.push(operand2.initialState);

                    hashTable[tempState.label] = tempState;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];

                    for (let index = 0; index < operand1.acceptStates.length; index++) {
                        const element = operand1.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    for (let index = 0; index < operand2.acceptStates.length; index++) {
                        const element = operand2.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    finalStack.push(result);
                }

            break;
            case ".": // We have four options for the concatenate operator.
                      // The two elements taken from the stack could be Result Object or normal operand [a-z]
                var operand1 = finalStack.pop();
                var operand2 = finalStack.pop();

                if(typeof(operand1) == 'string' && typeof(operand2) == 'string'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState[operand2] = [];
                    tempState[operand2].push('q' + stateCounter); // a: ['q1']
                    tempState['accept'] = false;

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1['EPSILON'].push('q' + stateCounter); // b: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;

                    var state2 = {};
                    state2['label'] = 'q' + stateCounter; //q2
                    stateCounter++;
                    state2['EPSILON'] = [];
                    state2['accept'] = false;
                    state2[operand1] = [];
                    state2[operand1].push('q' + stateCounter); // a: ['q1']

                    hashTable[state2.label] = state2;

                    var state3 = {};
                    state3['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state3['EPSILON'] = [];
                    state3['accept'] = true;

                    hashTable[state3.label] = state3;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];
                    result.acceptStates.push(state3.label);

                    finalStack.push(result);

                }
                else if(typeof(operand1) == 'object' && typeof(operand2) == 'string'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState[operand2] = [];
                    tempState[operand2].push('q' + stateCounter); // a: ['q1']
                    tempState['accept'] = false;

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1['EPSILON'].push(operand1.initialState); // b: ['q2']
                    state1['accept'] = false;

                    hashTable[state1.label] = state1;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = tempState.label;
                    result['acceptStates'] = [];

                    for (let index = 0; index < operand1.acceptStates.length; index++) {
                        const element = operand1.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    finalStack.push(result);

                }
                else if(typeof(operand1) == 'string' && typeof(operand2) == 'object'){

                    var tempState = {};
                    tempState['label'] = 'q' + stateCounter; //q0
                    stateCounter++;
                    tempState['EPSILON'] = [];
                    tempState[operand1] = [];
                    tempState[operand1].push('q' + stateCounter); // a: ['q1']
                    tempState['accept'] = false;

                    hashTable[tempState.label] = tempState;

                    var state1 = {};
                    state1['label'] = 'q' + stateCounter; //q1
                    stateCounter++;
                    state1['EPSILON'] = [];
                    state1['accept'] = true;

                    hashTable[state1.label] = state1;

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = operand2.initialState;
                    result['acceptStates'] = [];
                    result.acceptStates.push(state1.label);

                    for (let index = 0; index < operand2.acceptStates.length; index++) {
                        const element = operand2.acceptStates[index];
                        hashTable[element].EPSILON.push(tempState.label);
                        hashTable[element].accept = false;
                    }

                    finalStack.push(result);
                }
                else if(typeof(operand1) == 'object' && typeof(operand2) == 'object'){

                    var result = {};
                    result['label'] = 'R' + resultCounter;
                    resultCounter++;
                    result['initialState'] = operand2.initialState;
                    result['acceptStates'] = [];

                    for (let index = 0; index < operand2.acceptStates.length; index++) {
                        const element = operand2.acceptStates[index];
                        hashTable[element].EPSILON.push(operand1.initialState);
                        hashTable[element].accept = false;
                    }

                    for (let index = 0; index < operand1.acceptStates.length; index++) {
                        const element = operand1.acceptStates[index];
                        result.acceptStates.push(element);
                    }

                    finalStack.push(result);
                }

            break;
            default: // character
                finalStack.push(element);
            break;
        }
    }
}

function Parse(infixRegex){
    var stack = [];
    var queue = [];
    var precedence = { // operator presedences
        "*" : 3,
        "." : 2,
        "+" : 1
    }

    for (let index = 0; index < infixRegex.length; index++) {
        const element = infixRegex[index];

        if(element == "*" || element == "." || element == "+"){
            while(stack.length > 0 && precedence[stack[stack.length - 1]] >= precedence[element]){
                queue.push(stack.pop());
            }
            stack.push(element);
        }
        else if(element == "("){
            stack.push(element);
        }
        else if(element == ")"){
            while(stack[stack.length-1] != "("){
                queue.push(stack.pop());
            }
            stack.pop();
        }
        else{
            queue.push(element);
        }
    }

    while(stack.length > 0){
        queue.push(stack.pop());
    }

    return queue.toString().replaceAll(",", "");
}
