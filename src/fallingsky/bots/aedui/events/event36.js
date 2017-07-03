import FactionIDs from '../../../config/factionIds';
import FactionActions from '../../../../common/factionActions';
import TurnContext from 'common/turnContext'
import CommandIDs from '../../../config/commandIds';


class Event36 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const arverniPlayer = state.playersByFaction[FactionIDs.ARVERNI];
        const belgaePlayer = state.playersByFaction[FactionIDs.BELGAE];

        if (arverniPlayer.isNonPlayer && belgaePlayer.isNonPlayer) {
            return false;
        }

        throw 'Not yet implemented';
        const battleAction = aeduiBot.executeCommand(state, new TurnContext({
            id: 'e36',
            free: true,
            limited: true,
            allowedCommands: [CommandIDs.BATTLE],
            context: {
                noRetreat: true,
                noCounterattack: true,
                noCitadelEffect: true,
                noRevealAttackers: true
            }
        }));
        return battleAction && battleAction !== FactionActions.PASS;
    }
}

export default Event36;
