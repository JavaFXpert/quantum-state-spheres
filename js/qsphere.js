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
/*
  TODO:
    [] Use math.combinations(n, k) for binomial coefficient
 */
class QSphere extends BABYLON.Mesh {
    constructor(parentMesh, name, scene, quantumStateVector, endpointShapeType, showBasisStates, packedSphere) {
        super(name, scene);
        this.quantumStateVector = quantumStateVector;
        this.radius = 1;
        this.scene = scene;
        //this.gui3dManager = new BABYLON.GUI.GUI3DManager(scene);
        this.sphere = BABYLON.MeshBuilder.CreateSphere("qsphere", {
                diameterX: this.radius * 2,
                diameterY: this.radius * 2,
                diameterZ: this.radius * 2},
            scene);
        this.latLineColor = new BABYLON.Color3(.3, .3, .3);
        this.endpointShapeType = endpointShapeType;
        this.showBasisStates = showBasisStates;
        this.showPackedSphere = packedSphere;
        //this.parentMesh = parentMesh;
        this.sphere.parent = parentMesh;
        this.insignificantProbability = .0000000000000001;
        this.setupSphere();
    }

    /// Methods to construct the 3D QSphere
    setupSphere() {
        const myMaterial = new BABYLON.StandardMaterial("myMaterial", this.scene);
        this.sphere.material = myMaterial;
        myMaterial.alpha = 0.18;

        this.updateAppearanceWithStateVector(this.quantumStateVector);
    }

    createWeightLinesAndCenterPoint(numBits) {
        if (this.showPackedSphere) {
            this.createLatitude(0);
        }
        else {
            for (let weight = 0; weight <= numBits; weight++) {
                let y = -2 * weight / numBits + 1;
                this.createLatitude(y)
            }
        }

        const centerPoint = BABYLON.MeshBuilder.CreateSphere("centerPoint",
            {diameterX: this.radius * 0.025, diameterY: this.radius * 0.025, diameterZ: this.radius * 0.025}, this.scene);
        centerPoint.isPickable = false;
        centerPoint.parent = this.sphere;
        centerPoint.position = new BABYLON.Vector3(0, 0, 0);

    }

    createLatitude(yPos) {
        let radius = math.sqrt(1 - math.pow(yPos, 2));


        const myPoints = [];
        const deltaTheta = Math.PI / 20;
        let theta = 0;
        for (let i = 0; i < Math.PI * 20; i++) {
            myPoints.push(new BABYLON.Vector3(radius * Math.cos(theta), yPos, radius * Math.sin(theta)));
            theta += deltaTheta;
        }

        //Create lines
        const lines = BABYLON.MeshBuilder.CreateDashedLines("lines", {
            points: myPoints,
            updatable: true
        }, this.scene);
        lines.isPickable = false;
        lines.parent = this.sphere;
        lines.color = this.latLineColor;
        lines.alpha = 0.3;
        return lines;
    }

    makeTextPlane(textA, textB, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width: 300, height: 400}, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(textA, (8 - textA.length) * 6, 340, "bold 64px Arial", color, "transparent", true);
        dynamicTexture.drawText(textB, (8 - textB.length) * 6, 400, "bold 64px Arial", color, "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, this.scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    }

    updateAppearanceWithStateVector(stateVector) {
        let numStates = stateVector.size();
        let numBits = Math.log2(numStates);

        if (numBits != math.floor(numBits)) {
            console.log("Invalid statevector size: " + numStates);
        }

        this.createWeightLinesAndCenterPoint(numBits);

        // Remove the global phase TODO: Implement
        let loc = math.max(math.abs(stateVector));

        // console.log("numStates: " + numStates);

        let increment = math.PI * (3.0 - math.sqrt(5.0));
        if (this.showPackedSphere) {
            if (numStates == 4) {
                increment = math.PI;
            }
        }

        // TODO: REMOVE Calculate angle for penultimate state
        const ultimateStateAngle = (numStates - 2) * increment;


        for (let stateIndex = 0; stateIndex < numStates; stateIndex++) {

            let zCoord = 0;
            let angle = 0;

            // Calculate positions on sphere for Q-sphere or packed sphere layouts
            if (this.showPackedSphere) {

                const offset = 2.0 / numStates;
                if (stateIndex == 0) {
                    zCoord = 1.0;
                    angle = 0.0;
                }
                else if (stateIndex == numStates - 1) {
                    zCoord = -1.0;
                    angle = 0.0;
                }
                else {
                    // zCoord = ((stateIndex * offset) - 1) + (offset / 2);
                    zCoord = -((stateIndex * offset) - 1) - (offset / 2);
                    angle = ((stateIndex - 1) % (numStates - 2)) * increment;

                }
            }
            else {
                let weight = Hamming.calcWeight(stateIndex);
                zCoord = -2 * weight / numBits + 1;
                // console.log("numBits: " + numBits + ", weight: " + weight);
                let numDivisions = math.combinations(numBits, weight);
                let weightOrder = Hamming.weightIndex(stateIndex, numBits);
                angle = (weight * 1.0 / numBits) * (Math.PI * 2) + (weightOrder * 2 * Math.PI / numDivisions);
                if (weight > numBits / 2) {
                    angle = Math.PI - angle - (2 * Math.PI / numDivisions);
                }
                else if ((weight == numBits / 2) && (weightOrder >= numDivisions / 2)) {
                    angle = Math.PI - angle - (2 * Math.PI / numDivisions);
                }
            }
            let xCoord = math.sqrt(1 - math.pow(zCoord, 2)) * math.cos(angle);
            let yCoord = math.sqrt(1 - math.pow(zCoord, 2)) * math.sin(angle);

            let amplitude = math.subset(stateVector, math.index(stateIndex));
            let probability = math.multiply(amplitude, math.conj(amplitude));
            // console.log("stateIndex: " + stateIndex + ", amplitude: " + amplitude + ", probability: " + probability);

            const lineEndpoint = new BABYLON.Vector3(yCoord, zCoord, -xCoord);
            const basisStatePoints = [
                this.sphere.position,
                lineEndpoint
            ];
            const basisStateLine = BABYLON.MeshBuilder.CreateLines("basisStatePoints",
                {points: basisStatePoints}, this.scene);
            basisStateLine.color = Qutil.calcColorForPhase(amplitude);
            basisStateLine.isPickable = false;
            basisStateLine.parent = this.sphere;

            let alphaVal = 1;
            if (probability < this.insignificantProbability) {
                alphaVal = 0;
            }
            else {
                alphaVal = probability * 0.9 + 0.1;
            }
            if (alphaVal > 1.0) alphaVal = 1.0;
            basisStateLine.alpha = alphaVal;

            let diam = math.nthRoot((probability / ((math.PI * 4) / 3)), 3) * 2;
            if (diam < 0.15) {
                diam = 0.15;
            }

            let basisStateLineCap = null;

            if (probability < this.insignificantProbability) {
                // TODO: Make these black dots?
                basisStateLineCap = BABYLON.MeshBuilder.CreateSphere("quantumStateLineCap",
                    {
                        diameterX: diam * 0.07, // * this.radius * 0.25,
                        diameterY: diam * 0.07, // * this.radius * 0.25,
                        diameterZ: diam * 0.07
                    },
                    this.scene);
            }
            /// Experiment with using cone for line cap
            else {
                if (this.endpointShapeType == 1) {
                    basisStateLineCap = BABYLON.MeshBuilder.CreateCylinder("quantumStateLineCap",
                        {
                            height: diam * 0.28,
                            diameterTop: 0.0,
                            diameterBottom: diam * 0.04,
                            tessellation: 18,
                            subdivisions: 1
                        },
                        this.scene);
                }
                else {
                    basisStateLineCap = BABYLON.MeshBuilder.CreateSphere("quantumStateLineCap",
                        {
                            diameterX: diam * 0.07, // * this.radius * 0.25,
                            diameterY: diam * 0.07, // * this.radius * 0.25,
                            diameterZ: diam * 0.07
                        },
                        this.scene);

                }
            }

            basisStateLineCap.isPickable = false;
            basisStateLineCap.parent = this.sphere;
            basisStateLineCap.position = lineEndpoint;
            basisStateLineCap.rotation =
                new BABYLON.Vector3(math.asin(zCoord),
                    math.PI * 2 - angle,
                    amplitude.toPolar().phi - (math.PI / 2));

            if (this.showBasisStates) {
                const numBasisStateBits = Math.log2(this.quantumStateVector.size());
                const basisStateBitStr = stateIndex.toString(2);
                const zeroPaddedBasisStateBitStr = ("0".repeat(numBasisStateBits) + basisStateBitStr).substring(basisStateBitStr.length);
                const probabilityStr = probability < this.insignificantProbability ? "" : "P " + (probability / 1.0).toFixed(2).toString();
                const basisStateLabel = this.makeTextPlane(zeroPaddedBasisStateBitStr, probabilityStr, "black", 0.2);
                basisStateLabel.parent = basisStateLineCap;
                // Un-rotate the text from the cap
                //basisStateLabel.position = new BABYLON.Vector3(0.01, -0.03, 0.0);
                basisStateLabel.rotation =
                    new BABYLON.Vector3(0,
                        0,
                        math.PI - amplitude.toPolar().phi - (math.PI / 2));
                basisStateLabel.isPickable = false;
            }



            // TODO: See if we can create only one material per color (instead of for every sphere)
            const mat = new BABYLON.StandardMaterial("mat", this.scene);
            if (probability < this.insignificantProbability) {
                mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
            }
            else {
                mat.diffuseColor = Qutil.calcColorForPhase(amplitude);
            }
            basisStateLineCap.material = mat;
        }

    }
}

