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
class Hamming {

    /**
     * Calculates the Hamming weight of a number
     *
     * @param {number} num Number that holds the binary string for which to calculate the hamming weight.
     * @return {number} The Hamming weight
     */
    static calcWeight(bnum) {
        bnum = bnum - ((bnum >> 1) & 0x55555555);
        bnum = (bnum & 0x33333333) + ((bnum >> 2) & 0x33333333);
        return ((bnum + (bnum >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }

    /**
     * Returns the index of an integer with a given number of bits within the set of integers with
     * the same Hamming weight
     *
     * @param {number} bnum Integer that hold the binary string for which to find the index
     * @param {number} numBits Number of bits in the binary string
     * @return {number} Index of the given integer within the set of integers with the same Hamming weight
     */
    static weightIndex(bnum, numBits) {
        let bnumHamming = Hamming.calcWeight(bnum);
        let bnums = [];
        for (let num = 0; num < Math.pow(2, numBits); num++)  {
            let numHamming = Hamming.calcWeight(num);
            if (numHamming == bnumHamming) {
                bnums.push(num);
            }
        }
        // console.log("bnums: " + bnums);
        return bnums.indexOf(bnum);
    }
}
