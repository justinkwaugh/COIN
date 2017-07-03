import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import TurnContext from 'common/turnContext'

class Event48 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext(
                {
                    id: 'e47',
                    free: true,
                    limited: true,
                    allowLimitedSpecial: true
                }));
        const commandAction = aeduiBot.executeCommand(state, turn);
        turn.popContext();
        if (commandAction && commandAction !== FactionActions.PASS) {
            state.sequenceOfPlay.remainEligible(FactionIDs.AEDUI);
            return true;
        }
        return false;
    }
}

export default Event48;