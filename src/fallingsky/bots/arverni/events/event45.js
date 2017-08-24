import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import TurnContext from 'common/turnContext';
import ArverniBattle from 'fallingsky/bots/arverni/arverniBattle';

class Event45 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e45',
                                             free: true,
                                             limited: true,
                                             allowLimitedSpecial: true,
                                             context: {
                                                 litaviccus: true
                                             }
                                         }));
        const effective = ArverniBattle.battle(state, turn.getContext());
        turn.popContext();

        return effective;
    }
}

export default Event45
