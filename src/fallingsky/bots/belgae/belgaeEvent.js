import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event1 from './events/event1';
import Event3 from './events/event3';
import Event5 from './events/event5';
import Event6 from './events/event6';
import Event7 from './events/event7';
import Event8 from './events/event8';
import Event9 from './events/event9';
import Event12 from './events/event12';
import Event13 from './events/event13';
import Event15 from './events/event15';
import Event27 from './events/event27';
import Event30 from './events/event30';
import Event38 from './events/event38';
import Event43 from './events/event43';
import Event55 from './events/event55';
import Event59 from './events/event59';
import Event63 from './events/event63';

const NoEvents = [25, 52, 10, 37, 47, 4, 53, 32, 17, 26, 54, 20, 39, 69, 21];
const CapabilityEvents = [8, 12, 13, 15, 27, 30, 38, 43, 55, 59, 63];
const WinningArverniOrBotRomans = [7, 1, 5, 33, 3, 24];
const BotRomans = [40, 13, 15, 12];

const EventHandlers = {
    1: Event1,
    3: Event3,
    5: Event5,
    6: Event6,
    7: Event7,
    8: Event8,
    9: Event9,
    12: Event12,
    13: Event13,
    15: Event15,
    27: Event27,
    30: Event30,
    38: Event38,
    43: Event43,
    55: Event55,
    59: Event59,
    63: Event63
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