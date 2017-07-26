import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event8 from './events/event8';
import Event9 from './events/event9';
import Event10 from './events/event10';
import Event12 from './events/event12';
import Event13 from './events/event13';
import Event15 from './events/event15';
import Event22 from './events/event22';
import Event24 from './events/event24';
import Event25 from './events/event25';
import Event26 from './events/event26';
import Event27 from './events/event27';
import Event28 from './events/event28';
import Event30 from './events/event30';
import Event35 from './events/event35';
import Event36 from './events/event36';
import Event38 from './events/event38';
import Event39 from './events/event39';
import Event40 from './events/event40';
import Event41 from './events/event41';
import Event42 from './events/event42';
import Event43 from './events/event43';
import Event45 from './events/event45';
import Event46 from './events/event46';
import Event48 from './events/event48';
import Event49 from './events/event49';
import Event51 from './events/event51';
import Event52 from './events/event52';
import Event55 from './events/event55';
import Event56 from './events/event56';
import Event59 from './events/event59';
import Event63 from './events/event63';

const NoEvents = [58, 47, 1, 53, 32, 17, 72, 54, 20, 23, 69, 29];
const CapabilityEvents = [8,10,12,13,15,25,27,30,38,39,43,55,59,63];
const PlayerOrWinningBotRomans = [7, 16, 13, 4, 14, 55, 31, 56, 5, 15, 2, 6, 11, 3, 21, 12];
const RomansHandleEvent = [2, 3, 4, 5, 6, 7, 14, 18, 21, 31, 33];
const EventHandlers = {
    8: Event8,
    9: Event9,
    10: Event10,
    12: Event12,
    13: Event13,
    15: Event15,
    22: Event22,
    24: Event24,
    25: Event25,
    26: Event26,
    27: Event27,
    28: Event28,
    30: Event30,
    35: Event35,
    36: Event36,
    38: Event38,
    39: Event39,
    40: Event40,
    41: Event41,
    42: Event42,
    43: Event43,
    45: Event45,
    46: Event46,
    48: Event48,
    49: Event49,
    51: Event51,
    52: Event52,
    55: Event55,
    56: Event56,
    59: Event59,
    63: Event63
};

class AeduiEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        console.log('*** Is Aedui No Event? ***');
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Capability in final year? ***');
        if(state.isLastYear() && _.indexOf(CapabilityEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Are Romans a player or winning by too much? ***');
        if (_.indexOf(PlayerOrWinningBotRomans, currentCard.id) >= 0) {
            const player = state.playersByFaction[FactionIDs.ROMANS];
            const faction = state.factionsById[FactionIDs.ROMANS];
            if (!player.isNonPlayer || faction.victoryMargin(state) > -3) {
                return false;
            }
        }

        console.log('*** Should we ask Romans to handle this event? ***');
        if (_.indexOf(RomansHandleEvent, currentCard.id) >= 0) {
            const romanPlayer = state.playersByFaction[FactionIDs.ROMANS];
            return romanPlayer.handleEvent(state, currentCard);
        }

        console.log('*** Is Event effective? ***');
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

export default AeduiEvent;