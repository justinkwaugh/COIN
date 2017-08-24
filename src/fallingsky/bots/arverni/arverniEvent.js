import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event1 from './events/event1';
import Event3 from './events/event3';
import Event5 from './events/event5';
import Event6 from './events/event6';
import Event7 from './events/event7';
import Event8 from './events/event8';
import Event9 from './events/event9';
import Event11 from './events/event11';
import Event12 from './events/event12';
import Event13 from './events/event13';
import Event14 from './events/event14';
import Event15 from './events/event15';
import Event16 from './events/event16';
import Event17 from './events/event17';
import Event18 from './events/event18';
import Event19 from './events/event19';
import Event22 from './events/event22';
import Event23 from './events/event23';
import Event24 from './events/event24';
import Event25 from './events/event25';
import Event27 from './events/event27';
import Event28 from './events/event28';
import Event29 from './events/event29';
import Event30 from './events/event30';
import Event31 from './events/event31';
import Event33 from './events/event33';
import Event34 from './events/event34';
import Event35 from './events/event35';
import Event38 from './events/event38';
import Event39 from './events/event39';
import Event40 from './events/event40';
import Event41 from './events/event41';
import Event42 from './events/event42';
import Event43 from './events/event43';
import Event44 from './events/event44';
import Event45 from './events/event45';
import Event46 from './events/event46';
import Event48 from './events/event48';
import Event49 from './events/event49';
import Event50 from './events/event50';
import Event53 from './events/event53';
import Event56 from './events/event56';
import Event57 from './events/event57';
import Event58 from './events/event58';
import Event59 from './events/event59';
import Event63 from './events/event63';
import Event65 from './events/event65';
import Event68 from './events/event68';
import Event69 from './events/event69';
import Event70 from './events/event70';
import Event71 from './events/event71';

const NoEvents = [10,61,47,4,55,64,60,54,66];
const CapabilityEvents = [8,12,13,15,25,27,30,38,39,43,59,63];
const Auto1to4 = [7,13,14,5,59,15,2,33,19,27,3,23,24,21,30];

const EventHandlers = {
    1: Event1,
    3: Event3,
    5: Event5,
    6: Event6,
    7: Event7,
    8: Event8,
    9: Event9,
    11: Event11,
    12: Event12,
    13: Event13,
    14: Event14,
    15: Event15,
    16: Event16,
    17: Event17,
    18: Event18,
    19: Event19,
    22: Event22,
    23: Event23,
    24: Event24,
    25: Event25,
    27: Event27,
    28: Event28,
    29: Event29,
    30: Event30,
    31: Event31,
    33: Event33,
    34: Event34,
    35: Event35,
    38: Event38,
    39: Event39,
    40: Event40,
    41: Event41,
    42: Event42,
    43: Event43,
    44: Event44,
    45: Event45,
    46: Event46,
    48: Event48,
    49: Event49,
    50: Event50,
    53: Event53,
    56: Event56,
    57: Event57,
    58: Event58,
    59: Event59,
    63: Event63,
    65: Event65,
    68: Event68,
    69: Event69,
    70: Event70,
    71: Event71
};

class ArverniEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        console.log('*** Is Arverni No Event? ***');
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Capability in final year? ***');
        if(state.isLastYear() && _.indexOf(CapabilityEvents, currentCard.id) >= 0) {
            return false;
        }

        if (_.indexOf(Auto1to4, currentCard.id) < 0 && _.random(1,6) > 4) {
            return false;
        }

        const eventHandler = EventHandlers[currentCard.id];
        if (!eventHandler) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startEvent(currentCard.id);
        const handled = eventHandler.handleEvent(state);
        if(!handled) {
            state.turnHistory.getCurrentTurn().rollbackEvent();
        }
        else {
            state.turnHistory.getCurrentTurn().commitEvent();
        }

        return handled;
    }

}

export default ArverniEvent;