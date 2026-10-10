# raindrop-fx local adaptation

Source: https://github.com/SardineFish/raindrop-fx/blob/master/bundle/index.js
Downloaded 2026-10-10. MIT; complete upstream license in ../licenses/raindrop-fx-LICENSE.txt.

Two narrow changes to the bundled renderer:
1. `transparentBackground: true` clears to transparent and skips `drawBackground()`. The photograph remains available as a refraction texture. The original default behavior is preserved.
2. Composition uses RGB SRC_ALPHA / ONE_MINUS_SRC_ALPHA and alpha ONE / ONE_MINUS_SRC_ALPHA so translucent drop edges composite correctly onto the DOM.

Simulation, droplet texture, collision, trails, lighting and refraction remain upstream code.
The app disables built-in mist. One blur step is used only for the raindrop refraction texture (zero steps in this upstream bundle leaves that target unpopulated); the visible city and erasable fog remain independent. Its own animation driver passes elapsed seconds, instead of the bundle's fixed 0.03 per frame, to keep speed consistent across refresh rates.
