import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import TurnContext from 'common/turnContext'
import CommandIDs from '../../../config/commandIds';


class Event35 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({free: true, noBattle: true}));
        const commandAction = aeduiBot.executeCommand(state, turn);
        turn.popContext();
        if (commandAction) {
            turn.pushContext(new TurnContext({
                id: 'e35',
                limited: true,
                free: true,
                restrictedCommands: [CommandIDs.BATTLE]
            }));
            aeduiBot.executeCommand(state, turn);
            turn.popContext();
        }
        return commandAction && commandAction !== FactionActions.PASS;
    }
}

export default Event35;