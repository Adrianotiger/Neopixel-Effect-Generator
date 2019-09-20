# Rainbow effect

* Author: Adriano Petrucci
* Version: 1.0
* Changelog:
    * Version 1.4
        * fixed problem with Arduino code when rainbow does not fill complelty all leds 
    * Version 1.3
        * updated for Generator 2.0
    * Version 1.2
        * changed options name from length to rainbowlen, as length is a protected name
    * Version 1.1
        * Compile errors, when rainbow had a different length than the led strip length
    * 1.0:
        * First version

## Parameters
Parameter | Description | Values
--- | --- | ---
`steps`|steps to reproduce the entire animation, smaller values will give a faster but laggy effect bigger values will give a slower but more fluent effect.|1 to infinite
`length`|rainbow length, if this one has the same size as the led strip, you will see all colors on the same strip.|1 to 30000
`toLeft`|direction of the rainbow animation|to left or to right
`delay`|time between the steps, try to leave it as high as possible (this for all effects)*|1 to 30000

*delay: After setting the colors on the led strip, the timer need up to 0.07ms for each led. If you have 60 leds the Arduino need up to 4ms to update the strip. Remember it when you decrease this value.

## Description
![Algotithm](algorithm.png)

The rainbow effect can be done with at least 2 colors. The value of each color will change during the time (see image above)
