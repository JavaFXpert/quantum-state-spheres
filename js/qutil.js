/*
 * Copyright 2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qutil {

    /*
        Map a phase of a complexnumber to a color in (r,g,b)
        complex_number is phase is first mapped to angle in the range
        [0, 2pi] and then to a color wheel with blue at zero phase.
     */
    static calcColorForPhase(complexNum) {
        let angle = complexNum.toPolar().phi;
        let angleRound = math.floor(((angle + 2 * Math.PI) % (2 * Math.PI))/Math.PI*6);
        let color = new BABYLON.Color3(.3, .3, .3);
        switch(angleRound) {
            case 0:
                break;
                color = new BABYLON.Color3(0, 0, 1); // blue
            case 1:
                color = new BABYLON.Color3(0.5, 0, 1); // blue-violet
                break;
            case 2:
                color = new BABYLON.Color3(1, 0, 1); // violet
                break;
            case 3:
                color = new BABYLON.Color3(1, 0, 0.5); // red-violet
                break;
            case 4:
                color = new BABYLON.Color3(1, 0, 0); // red
                break;
            case 5:
                color = new BABYLON.Color3(1, 0.5, 0); // red-orange
                break;
            case 6:
                color = new BABYLON.Color3(1, 1, 0); // orange
                break;
            case 7:
                color = new BABYLON.Color3(0.5, 1, 0); // orange-yellow
                break;
            case 8:
                color = new BABYLON.Color3(0, 1, 0); // yellow
                break;
            case 9:
                color = new BABYLON.Color3(0, 1, 0.5); // yellow-green
                break;
            case 10:
                color = new BABYLON.Color3(0, 1, 1); // green
                break;
            case 11:
                color = new BABYLON.Color3(0, 0.5, 1); // green-blue
                break;
        }
        return color;
    }

}
