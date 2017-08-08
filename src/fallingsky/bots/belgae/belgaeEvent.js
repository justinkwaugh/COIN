import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event1 from './events/event1';
import Event2 from './events/event2';
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
import Event18 from './events/event18';
import Event19 from './events/event19';
import Event22 from './events/event22';
import Event23 from './events/event23';
import Event24 from './events/event24';
import Event27 from './events/event27';
import Event28 from './events/event28';
import Event29 from './events/event29';
import Event30 from './events/event30';
import Event31 from './events/event31';
import Event33 from './events/event33';
import Event34 from './events/event34';
import Event35 from './events/event35';
import Event36 from './events/event36';
import Event38 from './events/event38';
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
import Event55 from './events/event55';
import Event56 from './events/event56';
import Event57 from './events/event57';
import Event58 from './events/event58';
import Event59 from './events/event59';
import Event60 from './events/event60';
import Event61 from './events/event61';
import Event62 from './events/event62';
import Event63 from './events/event63';
import Event64 from './events/event64';
import Event65 from './events/event65';
import Event66 from './events/event66';
import Event68 from './events/event68';
import Event71 from './events/event71';

const NoEvents = [25, 52, 10, 37, 47, 4, 53, 32, 17, 26, 54, 20, 39, 69, 21];
const CapabilityEvents = [8, 12, 13, 15, 27, 30, 38, 43, 55, 59, 63];
const WinningArverniOrBotRomans = [7, 1, 5, 33, 3, 24];
const BotRomans = [40, 13, 15, 12];

const EventHandlers = {
    1: Event1,
    2: Event2,
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
    18: Event18,
    19: Event19,
    22: Event22,
    23: Event23,
    24: Event24,
    27: Event27,
    28: Event28,
    29: Event29,
    30: Event30,
    31: Event31,
    33: Event33,
    34: Event34,
    35: Event35,
    36: Event36,
    38: Event38,
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
    55: Event55,
    57: Event57,
    58: Event58,
    56: Event56,
    59: Event59,
    60: Event60,
    61: Event61,
    62: Event62,
    63: Event63,
    64: Event64,
    65: Event65,
    66: Event66,
    68: Event68,
    71: Event71
};

class BelgaeEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        console.log('*** Is Belgae No Event? ***');
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Capability in final year? ***');
        if (state.isLastYear() && _.indexOf(CapabilityEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Are Romans a bot? ***');
        const player = state.playersByFaction[FactionIDs.ROMANS];
        if (player.isNonPlayer && _.indexOf(BotRomans, currentCard.id) >= 0 || _.indexOf(WinningArverniOrBotRomans,
                                                                                         currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Are Arverni Winning? ***');
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        if (arverni.victoryMargin(state) > 0 && _.indexOf(WinningArverniOrBotRomans, currentCard.id) >= 0) {
            return false;
        }

        const eventHandler = EventHandlers[currentCard.id];
        if (!eventHandler) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startEvent(currentCard.id);
        const handled = eventHandler.handleEvent(state);
        if (!handled) {
            state.turnHistory.getCurrentTurn().rollbackEvent();
        }
        else {
            state.turnHistory.getCurrentTurn().commitEvent();
        }

        return handled;
    }

}

export default BelgaeEvent;