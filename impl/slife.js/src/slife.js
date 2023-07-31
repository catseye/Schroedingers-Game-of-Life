"use strict";

function launch(prefix, container, config) {
    config = config || {};
    if (typeof(container) === 'string') {
        container = document.getElementById(container);
    }
    var deps = [
        "controller.js",
        "playfield.js",
        "playfield-html-view.js",
        "element-factory.js",
        "preset-manager.js",
        "source-manager.js"
    ];
    var loaded = 0;
    for (var i = 0; i < deps.length; i++) {
        var elem = document.createElement('script');
        elem.src = prefix + deps[i];
        elem.onload = function() {
            if (++loaded != deps.length) return;

            /* --- state --- */

            var pf;

            /* --- state animation display --- */

            var controlPanel = yoob.makeDiv(container);
            controlPanel.style.textAlign = 'left';
            var viewPort = yoob.makeDiv(container);
            viewPort.style.textAlign = 'left';
            var stateDisplay = yoob.makePre(viewPort);
            var editor = yoob.makeTextArea(container, 60, 30);

            var v = (new yoob.PlayfieldHTMLView).init(pf, stateDisplay);
            v.render = function(state) {
                return dumpMapper(state);
            };

            /* --- controller --- */

            var c = (new yoob.Controller).init({
                'panelContainer': controlPanel,
                'reset': function(text) {
                    pf = new yoob.Playfield();
                    pf.setDefault('Dead');
                    pf.load(0, 0, text, loadMapper);
                    v.setPlayfield(pf);
                    v.draw();
                },
                'step': function() {
                    var newPf = new yoob.Playfield();
                    newPf.setDefault('Dead');
                    evolvePlayfield(pf, newPf);
                    pf = newPf;
                    v.setPlayfield(pf);
                    v.draw();
                }
            });

            /* --- source manager --- */

            var sm = (new yoob.SourceManager()).init({
                'editor': editor,
                'hideDuringEdit': [viewPort],
                'disableDuringEdit': [c.panel],
                'storageKey': 'slife.js',
                'panelContainer': controlPanel,
                'onDone': function() {
                    c.performReset(this.getEditorText());
                }
            });

            /* --- presets --- */

            var presetSelect = yoob.makeSelect(c.panel, "Preset:", []);

            var getExampleProgram = function(n) {
                for (var i = 0; i < examplePrograms.length; i++) {
                    if (examplePrograms[i].filename === n) {
                        return examplePrograms[i].contents;
                    }
                }
                return "";
            }
            var p = new yoob.PresetManager();
            p.init({
                'selectElem': presetSelect,
                'setPreset': function(n) {
                    c.clickStop(); // in case it is currently running
                    sm.loadSource(getExampleProgram(n));
                    sm.onDone();
                }
            });
            p.add('alive-cat-alive.sgol');
            p.add('big-demo.sgol');
            p.add('block-of-cats.sgol');
            p.add('cat-blinker.sgol');
            p.add('definitely-glider.sgol');
            p.add('fuse-with-cat.sgol');
            p.add('glider-with-1-cat.sgol');
            p.add('half-cat-block.sgol');
            p.add('lone-cell.sgol');
            p.add('maybe-glider.sgol');
            p.add('self-healing-block.sgol');

            p.select('big-demo.sgol');
        };
        document.body.appendChild(elem);
    }
}

/*
 * Schroedinger's Game of Life, implemented in Javascript
 */

function getMinMaxAlive(pf, x, y) {
    var minAlive = 0;
    var maxAlive = 0;
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            var nx = x + dx;
            var ny = y + dy;
            var st = pf.get(nx, ny);
            if (st === 'Alive') {
                minAlive += 1;
                maxAlive += 1;
            } else if (st === 'Dead') {
                minAlive += 0;
                maxAlive += 0;
            } else if (st === 'Cat') {
                minAlive += 0;
                maxAlive += 1;
            }
        }
    }
    return [minAlive, maxAlive];
}

function evolvePlayfield(pf, newPf) {
  pf.map(newPf, evalState, -1, -1, 1, 1);
}

function loadMapper(c) {
  if (c === '.') return 'Dead';
  if (c === '#') return 'Alive';
  if (c === '?') return 'Cat';
};

function dumpMapper(s) {
  if (s === 'Dead') return '.';
  if (s === 'Alive') return '#';
  if (s === 'Cat') return '?';
};

function evalAlive(pf, x, y) {
    var pair = getMinMaxAlive(pf, x, y);
    if ((pair[0] === 2 || pair[0] === 3) && (pair[1] === 2 || pair[1] === 3)) {
        return 'Alive';
    } else if (pair[0] >= 4 || pair[1] <= 1) {
        return 'Dead';
    } else return 'Cat';
}

function evalDead(pf, x, y) {
    var pair = getMinMaxAlive(pf, x, y);
    if (pair[0] === 3 && pair[1] === 3) {
        return 'Alive';
    } else if (pair[0] >= 4 || pair[1] <= 2) {
        return 'Dead';
    } else return 'Cat';
}

function evalCat(pf, x, y) {
    var pair = getMinMaxAlive(pf, x, y);
    if (pair[0] === 3 && pair[1] === 3) {
        return 'Alive';
    } else if (pair[0] >= 4 || pair[1] <= 1) {
        return 'Dead';
    } else return 'Cat';
}

function evalState(pf, x, y) {
    var stateId = pf.get(x, y);
    if (stateId === 'Alive') {
        return evalAlive(pf, x, y);
    } else if (stateId === 'Dead') {
        return evalDead(pf, x, y);
    } else {
        return evalCat(pf, x, y);
    }
}
